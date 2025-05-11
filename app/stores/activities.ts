import { defineStore } from 'pinia'
import {
  type Item,
  ItemType,
  shallowRef,
  // transformItem,
  // useFiltersStore,
  useFetch,
} from '#imports'

export const useActivitiesStore = defineStore('activities', () => {
  const items = shallowRef<Item[]>([])
  const itemTypes = shallowRef<Set<ItemType>>(new Set())
  const item = shallowRef<Item | undefined>(undefined)
  // const filtersStore = useFiltersStore()

  const load = async () => {
    const itemsResponse = await useFetch('/api/items')
    console.log(itemsResponse)
    // const resultList = await pb.collection('files').getList(1, 20, {
    //   filter: filtersStore.buildQuery(),
    // })
    items.value = itemsResponse.data.value.map((item) => {
      itemTypes.value.add(item.frontmatter.type)
      return {
        id: '1',
        title: 'asdf',
        content: 'asdf',
        done: false,
        type: ItemType.Debt,
        frontmatter: {
          season: 0,
          episode: 0,
          url: '',
          next_episode: '',
        },
      }
    })
  }

  return { items, item, itemTypes, load }
})
