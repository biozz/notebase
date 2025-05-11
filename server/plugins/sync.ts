import { promises, readFile, watch } from 'fs'
import { join, parse, relative } from 'path'
import { load as yamlLoad } from 'js-yaml'
import { defineNitroPlugin } from 'nitropack/runtime'
import type { SQLiteInsertValue } from 'drizzle-orm/sqlite-core'
import { tables, useDrizzle } from '../utils/drizzle'

const frontmatterRegex = /---\n(.*?)\n---/s

async function* walk(dir: string): AsyncGenerator<string> {
  for await (const d of await promises.opendir(dir)) {
    const entry = join(dir, d.name)
    if (d.isDirectory()) yield* walk(entry)
    else if (d.isFile()) yield entry
  }
}

export default defineNitroPlugin(async () => {
  const db = useDrizzle()
  await db.delete(tables.files)
  const startTime = Date.now()
  const rows: SQLiteInsertValue<typeof tables.files>[] = []
  for await (const p of walk(process.env.NOTES_ROOT!)) {
    const relPath = relative(process.env.NOTES_ROOT!, p)
    if (relPath.startsWith('.git')) continue
    if (relPath.startsWith('.obsidian')) continue
    if (relPath.startsWith('.trash')) continue
    if (relPath.startsWith('templates')) continue
    if (!relPath.endsWith('.md')) continue
    readFile(p, async (err, data) => {
      if (err) throw err
      const txt = data.toString()
      const fm = txt.match(frontmatterRegex)
      if (!fm) return
      if (!fm[1]) return
      rows.push({
        path: relPath,
        slug: parse(p).name,
        frontmatter: JSON.stringify(yamlLoad(fm[1].trim()), null, 2),
        content: txt,
      })
      if (rows.length > 100) {
        await db.insert(tables.files).values(rows)
        rows.length = 0
      }
    })
  }
  console.log(`Synced ${process.env.NOTES_ROOT!} in ${Date.now() - startTime}ms`)
  console.log('Watching for changes...')
  // watch(process.env.NOTES_ROOT!, { recursive: true }, async (event, filename) => {
  //   console.log(`Detected ${event} in ${filename}`)
  // })
})
