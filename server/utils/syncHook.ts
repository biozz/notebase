import { promises, readFile, watch } from 'fs'
import { join } from 'path'
import { load as yamlLoad } from 'js-yaml'
import { tables, useDrizzle } from '../utils/drizzle'

const notesDir = '/Users/biozz/projects/notes'
const frontmatterRegex = /---\n(.*?)\n---/s

async function* walk(dir: string): AsyncGenerator<string> {
  for await (const d of await promises.opendir(dir)) {
    const entry = join(dir, d.name)
    if (d.isDirectory()) yield* walk(entry)
    else if (d.isFile()) yield entry
  }
}

watch(notesDir, { recursive: true }, async (event, filename) => {
  console.log(`Detected ${event} in ${filename}`)
})

export async function syncHook() {
  for await (const p of walk(notesDir)) {
    if (p.startsWith('/Users/biozz/projects/notes/.git')) continue
    if (p.startsWith('/Users/biozz/projects/notes/.obsidian')) continue
    if (p.startsWith('/Users/biozz/projects/notes/.trash')) continue
    if (p.startsWith('/Users/biozz/projects/notes/templates')) continue
    if (!p.endsWith('.md')) continue
    readFile(p, async (err, data) => {
      console.log(p, data.length)
      if (err) throw err
      const txt = data.toString()
      const fm = txt.match(frontmatterRegex)
      if (!fm) return
      await useDrizzle().insert(tables.files).values({
        path: p,
        slug: p.replace(notesDir, ''),
        frontmatter: JSON.stringify(yamlLoad(fm[1].trim()), null, 2),
        content: txt,
      })
    })
  }
}
