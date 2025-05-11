import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const files = sqliteTable('files', {
  id: integer().primaryKey({ autoIncrement: true }),
  path: text(),
  slug: text(),
  frontmatter: text({ mode: 'json' }),
  content: text(),
  created: integer({ mode: 'timestamp_ms' }),
  updated: integer({ mode: 'timestamp_ms' }),
})
