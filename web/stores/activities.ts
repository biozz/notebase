import { defineStore } from 'pinia'
import {
  pb,
  type Item,
  type ItemType,
  shallowRef,
  watchDebounced,
  transformItem,
} from '#imports'

export const useActivitiesStore = defineStore('activitiesStore', () => {
  const items = shallowRef<Item[]>([])
  const itemTypes = shallowRef<Set<ItemType>>(new Set())
  const item = shallowRef<Item | undefined>(undefined)
  const query = shallowRef('')

  const load = async () => {
    let filter = query.value
    if (filter.length === 0) {
      filter = 'path ~ \'inbox/activities/%\''
    }
    const result = await pb.collection('files').getFullList({
      filter: filter,
    })
    items.value = result.map((item) => {
      itemTypes.value.add(item.frontmatter.type)
      return transformItem(item)
    })
  }

  watchDebounced(
    query,
    async () => {
      await load()
    },
    { debounce: 300 },
  )

  return { items, item, itemTypes, load, query }
})
