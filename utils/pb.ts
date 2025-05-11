import PocketBase, { type RecordModel } from 'pocketbase'
import { useRuntimeConfig } from '#app'
import type { Item } from '#imports'

const config = useRuntimeConfig()

export const pb = new PocketBase(config.public.apiBase)

// TODO: fix type assertion with validation library
export function transformItem(item: RecordModel): Item {
  return {
    id: item.id,
    title: item.frontmatter.title || item.frontmatter.summary,
    content: item.content,
    done: !!item.frontmatter.completed,
    type: item.frontmatter.type,
    frontmatter: item.frontmatter,
  }
}
