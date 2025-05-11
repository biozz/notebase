# 2025-05-07 Files table is minimal

I want files table to be minimal and this is what I currently think is enough:

- id, created, updated - system fields, provided by PocketBase
- path - relative path of the note from the root
- slug - a name of the file without an extension
- frontmatter - frontmatter of the note
- content - the contents of the note sans frontmatter
- hash - md5 hash of the frontmatter+content (see [0003_synchronization_2.md](./0003_synchronization_2.md))

Assumptions:

- slug in my case is something matching `\w+`, meaning a "word", this is a historical things on how I manage my notes, I haven't tested filenames with spaces
- frontmatter already contains some metadata provdided by the Obsidian Linter plugin (like tags, aliases, timestamps)
