package main

import (
	"crypto/md5"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/gobwas/glob"
	"github.com/goccy/go-yaml"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/spf13/cobra"
)

func syncCmd(app *pocketbase.PocketBase) *cobra.Command {
	return &cobra.Command{
		Use:   "sync",
		Short: "Scan notes directory and load markdown files into the files table",
		Run: func(cmd *cobra.Command, args []string) {
			root, _ := cmd.Flags().GetString("root")
			restartCh := make(chan struct{})
			syncJobManager(restartCh, app, root)
		},
	}
}

type NotebaseConfig struct {
	ClearOnStartup bool     `yaml:"clear_on_startup"`
	Exclude        []string `yaml:"exclude"`
}

// syncJob loads markdown files into an SQLite database and synchronizes
//
//	the changes between the files system and the database.
//
// There are several parts to the sync job:
//   - it clears the database on startup and heavily rely on this during development
//   - it has a bunch of other settings, like notes root dir and exclude patterns
//   - it starts a filesystem watcher early, because I am going to go through all
//     the directories upon initial scan anyway
//   - all the parsing is done in parallel in goroutines
//   - after parsing the results are sent to the saving process
//     which also works in parallel in goroutine in batches
func syncJob(app *pocketbase.PocketBase, root string, stopCh <-chan struct{}, doneCh chan<- struct{}) {
	data, err := os.ReadFile(path.Join(root, ".notebase.yml"))
	if err != nil {
		app.Logger().Error("error reading config", "error", err)
		return
	}
	config := NotebaseConfig{}
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		app.Logger().Error("error parsing config", "error", err)
		return
	}

	startTime := time.Now()

	if config.ClearOnStartup {
		_, err := app.DB().NewQuery("DELETE FROM files").Execute()
		if err != nil {
			app.Logger().Error("unable to clear files table", err)
			return
		}
	}

	patterns := make([]glob.Glob, 0, len(config.Exclude))
	for _, pattern := range config.Exclude {
		g, err := glob.Compile(pattern)
		if err != nil {
			app.Logger().Error("Invalid glob pattern", "pattern", pattern, "error", err)
			continue
		}
		patterns = append(patterns, g)
	}

	fsnotifyWatcher, err := fsnotify.NewWatcher()
	if err != nil {
		app.Logger().Error("error creating fsnotify watcher", "error", err)
		return
	}

	go setupFileWatcher(app, fsnotifyWatcher, root)

	filesChan := make(chan string, 100)
	resultsChan := make(chan File, 100)

	var parseWg sync.WaitGroup
	var saveWg sync.WaitGroup

	numWorkers := runtime.NumCPU()
	app.Logger().Debug("Starting parser workers", "count", numWorkers)
	for i := 0; i < numWorkers; i++ {
		parseWg.Add(1)
		go func() {
			defer parseWg.Done()
			for path := range filesChan {
				data, err := parse(app, root, path)
				if err != nil {
					app.Logger().Error("error parsing file", "path", path, "error", err)
					continue
				}
				resultsChan <- data
			}
		}()
	}

	const batchSize = 500
	saveWg.Add(1)
	go func() {
		defer saveWg.Done()
		batch := make([]File, 0, batchSize)

		processBatch := func() {
			if len(batch) == 0 {
				return
			}

			err := app.RunInTransaction(func(txApp core.App) error {
				for _, data := range batch {
					filesCol, err := txApp.FindCollectionByNameOrId("files")
					if err != nil {
						return err
					}
					fileRec := core.NewRecord(filesCol)
					fillFileRecFromData(fileRec, data)
					if err := txApp.Save(fileRec); err != nil {
						return err
					}
				}
				return nil
			})

			if err != nil {
				app.Logger().Error("error saving batch", "error", err)
				return
			}
			// Clear batch but reuse the underlying array
			batch = batch[:0]
		}

		for data := range resultsChan {
			batch = append(batch, data)
			if len(batch) >= batchSize {
				processBatch()
			}
		}
		processBatch()
	}()

	// Walk directory and send files to workers
	app.Logger().Debug("Walking directory", "root", root)

	err = filepath.Walk(root, func(walkPath string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if isExcluded(patterns, walkPath) {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		if info.IsDir() {
			if err = fsnotifyWatcher.Add(walkPath); err != nil {
				return err
			}
			return nil
		}

		if filepath.Ext(walkPath) == ".md" {
			filesChan <- walkPath
		}
		return nil
	})

	if err != nil {
		app.Logger().Error("unable to walk files", err)
	}

	close(filesChan)
	parseWg.Wait()
	close(resultsChan)
	saveWg.Wait()

	elapsedTime := time.Since(startTime)
	app.Logger().Info("Initial sync complete", "elapsed", elapsedTime.String())

	app.OnRecordUpdate("files").BindFunc(func(e *core.RecordEvent) error {
		newYaml := jsonToYaml(e.Record.GetString("frontmatter"))
		newContent := "---\n" + newYaml + "---" + e.Record.GetString("content")
		e.Record.Set("hash", fmt.Sprintf("%x", md5.Sum([]byte(newContent))))
		return e.Next()
	})
	app.OnRecordAfterUpdateSuccess("files").BindFunc(func(e *core.RecordEvent) error {
		relPath := e.Record.GetString("path")
		absPath := path.Join(root, relPath)
		hash := e.Record.GetString("hash")

		f, err := parse(app, root, absPath)
		if err != nil {
			app.Logger().Error("error parsing file", "path", relPath, "error", err)
			return e.Next()
		}
		app.Logger().Debug("hashes", "old", hash, "new", f.Hash)
		if hash == f.Hash {
			return e.Next()
		}
		err = saveToDisk(
			absPath,
			e.Record.GetString("content"),
			e.Record.GetString("frontmatter"),
		)
		if err != nil {
			app.Logger().Error("Error saving file to disk", "error", err)
			return e.Next()
		}
		app.Logger().Info("File saved to disk", "path", relPath)

		return e.Next()
	})

	// Endless loop required to keep running and restart the job
	for {
		select {
		case <-stopCh:
			doneCh <- struct{}{}
			return
		}
	}
}

func syncJobManager(restartCh <-chan struct{}, app *pocketbase.PocketBase, root string) {
	for {
		stopCh := make(chan struct{})
		doneCh := make(chan struct{})
		go syncJob(app, root, stopCh, doneCh)
		<-restartCh
		close(stopCh)
		<-doneCh
	}
}

func saveToDisk(path string, content string, frontmatterRaw string) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	newYaml := jsonToYaml(frontmatterRaw)

	if newYaml == "" {
		return fmt.Errorf("error converting JSON to YAML")
	}
	if _, err := file.WriteString("---\n" + newYaml + "---"); err != nil {
		return err
	}

	if _, err := file.WriteString(content); err != nil {
		return err
	}

	return nil
}

func jsonToYaml(jsonRaw string) string {
	if jsonRaw == "" {
		return ""
	}
	var yamlData yaml.MapSlice
	err := yaml.Unmarshal([]byte(jsonRaw), &yamlData)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	yamlBytes, err := yaml.Marshal(yamlData)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	return string(yamlBytes)
}

func debounce[T any](input <-chan T, duration time.Duration) <-chan T {
	out := make(chan T)
	go func() {
		defer close(out)
		var (
			timer     *time.Timer
			lastEvent T
		)

		// Helper function to reset/stop the timer safely.
		resetTimer := func() {
			if timer == nil {
				timer = time.NewTimer(duration)
			} else {
				if !timer.Stop() {
					// Drain the channel if needed.
					select {
					case <-timer.C:
					default:
					}
				}
				timer.Reset(duration)
			}
		}

		for {
			var timerC <-chan time.Time
			if timer != nil {
				timerC = timer.C
			}
			select {
			// Read a new event from the watcher.
			case event, ok := <-input:
				if !ok {
					return // Input closed
				}
				lastEvent = event
				resetTimer()
			// The debounce period finished; send out the last event.
			case <-timerC:
				out <- lastEvent
				// After emitting the event, nil the timer so a new one will be created upon a new event.
				timer = nil
			}
		}
	}()
	return out
}

func setupFileWatcher(app *pocketbase.PocketBase, watcher *fsnotify.Watcher, root string) {
	// debouncedWatcherEvents := debounce(watcher.Events, 200*time.Millisecond)
	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			if filepath.Ext(event.Name) != ".md" {
				continue
			}
			if event.Op.Has(fsnotify.Chmod) {
				continue
			}
			if event.Op&fsnotify.Create == fsnotify.Create {
				fi, err := os.Stat(event.Name)
				if err == nil && fi.IsDir() {
					if err := watcher.Add(event.Name); err != nil {
						app.Logger().Error("error watching new directory", "error", err)
					}
				}
			}
			app.Logger().Info("fsnotify event", "op", event.Op.String(), "path", event.Name)
			handleFSNotifyEvent(app, event.Op.String(), root, event.Name)
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			app.Logger().Error("fsnotify error", "error", err)
		}
	}
}

func isExcluded(patterns []glob.Glob, path string) bool {
	for _, pattern := range patterns {
		if pattern.Match(path) {
			return true
		}
	}
	return false
}

type File struct {
	FrontMatter     yaml.MapSlice
	FrontMatterJSON string
	Content         string
	AbsPath         string
	RelPath         string
	Slug            string
	Links           []string
	Tags            []string
	Hash            string
}

var (
	linkRegex = regexp.MustCompile(`\[\[(\S*)\]\]`)
)

func parse(app *pocketbase.PocketBase, rootPath string, curPath string) (File, error) {
	relPath, _ := filepath.Rel(rootPath, curPath)
	fileName := filepath.Base(relPath)
	slug := strings.TrimSuffix(fileName, filepath.Ext(fileName))
	content, err := os.ReadFile(curPath)
	if err != nil {
		return File{}, err
	}

	contentStr := string(content)

	data := File{
		AbsPath:     curPath,
		RelPath:     relPath,
		Slug:        slug,
		FrontMatter: yaml.MapSlice{},
		Links:       []string{},
		Tags:        []string{},
		Hash:        fmt.Sprintf("%x", md5.Sum(content)),
	}

	// Extract frontmatter
	frontMatter, mainContent := extractFrontMatter(contentStr)

	if len(frontMatter) > 0 {
		yaml.Unmarshal([]byte(frontMatter), &data.FrontMatter)
		jsonBytes, err := yaml.MarshalWithOptions(data.FrontMatter, yaml.JSON())
		if err != nil {
			app.Logger().Warn("error converting frontmatter to JSON", "error", err)
			data.FrontMatterJSON = "{}"
		} else {
			data.FrontMatterJSON = string(jsonBytes)
		}
	}

	// Store content
	data.Content = mainContent

	// Find all links in one pass
	linkMap := make(map[string]bool)
	linkMatches := linkRegex.FindAllStringSubmatch(contentStr, -1)
	for _, match := range linkMatches {
		if len(match[1]) > 0 {
			linkMap[match[1]] = true
		}
	}

	// Convert link map to slice
	for link := range linkMap {
		data.Links = append(data.Links, link)
	}

	return data, nil
}

func extractFrontMatter(content string) (frontMatter, mainContent string) {
	// Check if content starts with "---"
	if !strings.HasPrefix(content, "---\n") {
		return "", content
	}

	// Find the closing "---"
	endIndex := strings.Index(content[4:], "---")
	if endIndex == -1 {
		return "", content
	}

	endIndex += 4 // Adjust for the initial offset
	frontMatter = content[4:endIndex]
	mainContent = content[endIndex+3:] // Skip past the closing "---"

	return frontMatter, mainContent
}

type WatcherEvent struct {
	EventType string
	Path      string
}

func handleFSNotifyEvent(app *pocketbase.PocketBase, event string, rootPath string, curPath string) {
	switch event {
	case "CREATE", "WRITE":
		data, err := parse(app, rootPath, curPath)
		if err != nil {
			app.Logger().Error("unable to parse", err)
			return
		}

		if event == "CREATE" {
			if data.Slug == "Untitled" {
				// thi is probably a placeholder file, created by Obsidian, ignore it
				return
			}
			if err := createFile(app, data); err != nil {
				app.Logger().Error("unable to create file", err)
			}
			return
		}

		if event == "WRITE" {
			if err := updateFile(app, data); err != nil {
				app.Logger().Error("unable to create file", err)
			}
			return
		}
	case "REMOVE", "RENAME":
		if err := deleteFile(app, curPath); err != nil {
			app.Logger().Error("unable to delete file", err)
		}
	}
}

func createFile(app *pocketbase.PocketBase, data File) error {
	filesCol, err := app.FindCollectionByNameOrId("files")
	if err != nil {
		return err
	}
	fileRec := core.NewRecord(filesCol)
	fillFileRecFromData(fileRec, data)
	if err := app.Save(fileRec); err != nil {
		app.Logger().Error("Error saving file record", "error", err)
		return err
	}
	return nil
}

func fillFileRecFromData(fileRec *core.Record, data File) {
	fileRec.Load(map[string]any{
		"path":        data.RelPath,
		"slug":        data.Slug,
		"content":     data.Content,
		"frontmatter": data.FrontMatterJSON,
		"hash":        data.Hash,
		// tags?
		// links?
	})
}

func updateFile(app *pocketbase.PocketBase, data File) error {
	fileRec, err := app.FindFirstRecordByData("files", "path", data.RelPath)
	if err != nil {
		return err
	}
	curHash := fileRec.GetString("hash")
	if curHash == data.Hash {
		app.Logger().Debug("File hash unchanged, skipping update", "path", data.RelPath)
		return nil
	}
	fillFileRecFromData(fileRec, data)
	if err := app.Save(fileRec); err != nil {
		app.Logger().Error("Error updating file record", "error", err)
		return err
	}
	return nil
}

func deleteFile(app *pocketbase.PocketBase, path string) error {
	fileRec, err := app.FindFirstRecordByData("files", "path", path)
	if err != nil {
		return err
	}
	if err := app.Delete(fileRec); err != nil {
		app.Logger().Error("Error deleting file record", "error", err)
		return err
	}
	return nil
}
