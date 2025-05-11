import { defineStore } from 'pinia'
import {
  type Item,
  type ItemType,
  shallowRef,
  transformItem,
  useFiltersStore,
  useNuxtApp,
} from '#imports'


export const useActivitiesStore = defineStore('activities', () => {
  const { $pb } = useNuxtApp()

  const items = shallowRef<Item[]>([])
  const itemTypes = shallowRef<Set<ItemType>>(new Set())
  const item = shallowRef<Item | undefined>(undefined)
  const filtersStore = useFiltersStore()

  const load = async () => {
    const resultList = await $pb.client.collection('files').getList(1, 20, {
      filter: filtersStore.buildQuery(),
    })
    items.value = resultList.items.map((item) => {
      itemTypes.value.add(item.frontmatter.type)
      return transformItem(item)
    })
  }

  return { items, item, itemTypes, load }
})
