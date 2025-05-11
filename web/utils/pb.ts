import type { RecordModel } from 'pocketbase'

import type { Item } from '#imports'



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
