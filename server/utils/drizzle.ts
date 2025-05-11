import { drizzle } from 'drizzle-orm/bun-sql'
import { SQL } from 'bun'
import * as schema from '../database/schema'

export { sql, eq, and, or } from 'drizzle-orm'

export const tables = schema

export function useDrizzle() {
  const sqlite = new SQL('file:./db.sqlite')
  return drizzle({ client: sqlite, schema: schema })
}

export type File = typeof schema.files.$inferSelect
