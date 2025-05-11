import { defineStore } from 'pinia'
import {
  pb,
  type Item,
  type ItemType,
  shallowRef,
  transformItem,
  useFiltersStore,
} from '#imports'

export const useActivitiesStore = defineStore('activities', () => {
  const items = shallowRef<Item[]>([])
  const itemTypes = shallowRef<Set<ItemType>>(new Set())
  const item = shallowRef<Item | undefined>(undefined)
  const filtersStore = useFiltersStore()

  const load = async () => {
    const resultList = await pb.collection('files').getList(1, 20, {
      filter: filtersStore.buildQuery(),
    })
    items.value = resultList.items.map((item) => {
      itemTypes.value.add(item.frontmatter.type)
      return transformItem(item)
    })
  }

  return { items, item, itemTypes, load }
})
