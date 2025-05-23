import { defineQuery, useClient, useFiltersStore, useMutation, useQuery } from '#imports'
import type { ItemRecord } from '#pocketbase-imports'

export const useActivitiesQuery = defineQuery(() => {
  const pb = useClient()
  const filtersStore = useFiltersStore()

  const { state } = useQuery({
    key: () => ['activities', { filters: filtersStore.buildQuery() }],
    query: async () => await pb.getList(1, 20, filtersStore.buildQuery()),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })

  return { state }
})

export const useActivitiesAddItemMutation = (opts: { onSuccess?: (item: ItemRecord) => void }) => {
  const _pb = useClient()

  const { state, mutate } = useMutation({
    key: () => ['activities', 'addItem'], // optional
    mutation: async (item: ItemRecord) => new Promise((resolve, reject) =>
      setTimeout(() => Math.random() > 0.5 ? resolve(item) : reject(new Error('Error')), 500),
    ),
    onSuccess(_data, vars) {
      opts.onSuccess?.(vars)
    },
  })

  return { state, mutate }
}

export const useActivitiesUpdateItemMutation = (opts: { onSuccess?: (item: ItemRecord) => void }) => {
  const _pb = useClient()

  const { state, mutate } = useMutation({
    key: () => ['activities', 'updateItem'], // optional
    mutation: async (item: ItemRecord) => new Promise((resolve, reject) =>
      setTimeout(() => Math.random() > 0.5 ? resolve(item) : reject(new Error('Error')), 500),
    ),
    onSuccess(_data, vars) {
      opts.onSuccess?.(vars)
    },
  })

  return { state, mutate }
}
