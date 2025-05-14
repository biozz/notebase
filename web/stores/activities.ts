import { defineStore } from 'pinia'
import {
  shallowRef,
  useFiltersStore,
  useClient,
} from '#imports'
import type { ItemRecord, ItemType } from '#pocketbase-imports'

export const useActivitiesStore = defineStore('activities', () => {
  const pb = useClient()

  const items = shallowRef<ItemRecord[]>([])
  const itemTypes = shallowRef<Set<ItemType>>(new Set())
  const item = shallowRef<ItemRecord | undefined>(undefined)
  const filtersStore = useFiltersStore()

  const load = async () => {
    const resultList = await pb.getList(1, 20, filtersStore.buildQuery())
    items.value = resultList.items
  }

  function addItem(item: ItemRecord) {
    const itemExists = items.value.find(i => i.id === item.id)
    if (itemExists) {
      updateItem(item)
    }
    else {
      items.value = [...items.value, item]
    }
  }

  function updateItem(item: ItemRecord) {
    items.value = items.value.map(i => i.id === item.id ? item : i)
  }

  return { items, item, itemTypes, load, addItem, updateItem }
})
