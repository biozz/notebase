import { drizzle } from 'drizzle-orm/bun-sql'
import * as schema from '../database/schema'

export { sql, eq, and, or } from 'drizzle-orm'

export const tables = schema

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}

export type User = typeof schema.users.$inferSelect
