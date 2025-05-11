import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from '../database/schema'

export { sql, eq, and, or } from 'drizzle-orm'

export const tables = schema

export function useDrizzle() {
  return drizzle({ connection: 'file:./db.sqlite', schema: schema })
}

export type File = typeof schema.files.$inferSelect
