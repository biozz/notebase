import { z } from 'zod/v4-mini'

export const itemTypes = {
  track: 'track',
  debt: 'debt',
  task: 'task',
  groceries: 'groceries',

  none: 'none',
} as const

export type ItemType = (typeof itemTypes)[keyof typeof itemTypes]

export const debtTransactionSchema = z.object({
  amount: z.number(),
  created: z.string(),
  comment: z.nullish(z.string()),
})

export const groceriesItemSchema = z.object({
  name: z.string(),
  done: z.boolean(),
})
export const groceriesFrontmatterSchema = z.object({
  checklist: z.array(groceriesItemSchema),
})

export const baseFrontmatterSchema = z.looseObject({
  title: z.nullish(z.string()),
  summary: z.nullish(z.string()),
  type: z.nullish(z.enum(Object.values(itemTypes))),
  completed: z.nullish(z.string()),
  aliases: z.nullish(z.string()),
  tags: z.nullish(z.array(z.string())),
})

export const debtFrontmatterSchema = z.extend(baseFrontmatterSchema, {
  currency: z.string(),
  transactions: z.array(debtTransactionSchema),
})

export const trackFrontmatterSchema = z.extend(baseFrontmatterSchema, {
  season: z.number(),
  episode: z.number(),
  next_episode: z.string(),
  url: z.string(),
})

export const frontmatterSchema = z.extend(baseFrontmatterSchema, {
  currency: z.nullish(z.string()),
  transactions: z.nullish(z.array(debtTransactionSchema)),
  season: z.nullish(z.number()),
  episode: z.nullish(z.number()),
  next_episode: z.nullish(z.string()),
  url: z.nullish(z.string()),
  due: z.nullish(z.string()),
  status: z.nullish(z.string()),
  priority: z.nullish(z.string()),
  modified: z.nullish(z.string()),
  rating: z.nullish(z.string()),
  items: z.nullish(z.array(groceriesItemSchema)),
})

export const recordSchema = z.object({
  id: z.string(),
  content: z.string(),
  created: z.string(),
  path: z.string(),
  slug: z.string(),
  updated: z.string(),
  frontmatter: z.nullish(frontmatterSchema),
})

export const activityFilterSchema = z.object({
  id: z.string(),
  label: z.string(),
  filters: z.json(),
  created: z.string(),
  updated: z.string(),
})

export type ItemRecord = z.infer<typeof recordSchema>

export type Frontmatter = z.infer<typeof frontmatterSchema>

export type DebtFrontmatter = z.infer<typeof debtFrontmatterSchema>
export type DebtTransaction = z.infer<typeof debtTransactionSchema>

export type TrackFrontmatter = z.infer<typeof trackFrontmatterSchema>

export type GroceriesFrontmatter = z.infer<typeof groceriesFrontmatterSchema>
export type GroceriesItem = z.infer<typeof groceriesItemSchema>

export type ActivityFilter = z.infer<typeof activityFilterSchema>
