---
aliases: null
tags: null
---

# index

```dataviewjs
dv.pages().where(p => p.file.name !== this.file.name)
```

```js
dv.pages().where(p => p.file.name !== this.file.name)
```

```ts

export default function useMarkdownParser() {
  let parser: Awaited<ReturnType<typeof createMarkdownParser>>

  const parse = async (markdown: string) => {
    if (!parser) {
      parser = await createMarkdownParser({
        // TODO: uncomment when shiki supports fallback languages
        // rehype: {
        //   plugins: {
        //     highlight: {
        //       instance: rehypeHighlight,
        //       options: {
        //         // Pass in your desired theme(s)
        //         theme: 'material-theme-palenight',
        //         // Create the Shiki highlighter
        //         highlighter: createShikiHighlighter({
        //           bundledThemes: {
        //             'material-theme-palenight': MaterialThemePalenight,
        //           },
        //           // Configure the bundled languages
        //           bundledLangs: {
        //             yml: YamlLang,
        //             ts: TsLang,
        //             js: JsLang,
        //             typescript: TsLang,
        //             dataviewjs: JsLang,
        //           },
        //         }),
        //       },
        //     },
        //   },
        // },
      })
    }
    return parser(markdown)
  }

  return parse
}

```
