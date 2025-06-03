import {
  defineQuery,
  useClient,
  useMutation,
  useQuery,
  useQueryCache,
} from '#imports'
import type { ActivityFilter } from '~/modules/pocketbase/types/schema'

export const useFiltersListQuery = defineQuery(() => {
  const client = useClient()

  const { state, error, asyncStatus } = useQuery<ActivityFilter[]>({
    key: () => ['filters'],
    query: async () => {
      return await client.getFilters()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })

  return { state, error, asyncStatus }
})

export const useFiltersUpdateMutation = (
  opts: { onSuccess?: (filter: ActivityFilter) => Promise<void> | void } = {},
) => {
  const client = useClient()
  const queryCache = useQueryCache()

  const mutation = useMutation({
    mutation: async ({ id, data }: { id: string, data: string }) =>
      await client.updateFilter(id, data),
    async onSuccess(_data, vars) {
      await opts.onSuccess?.(_data)
    },
    async onSettled() {
      await queryCache.invalidateQueries({ key: ['filters'], exact: false })
    },
  })

  return mutation
}

export const useFiltersCreateMutation = (
  opts: { onSuccess?: (filter: ActivityFilter) => Promise<void> | void } = {},
) => {
  const client = useClient()
  const queryCache = useQueryCache()

  const mutation = useMutation({
    mutation: async (label: string) => await client.createFilter(label),
    async onSuccess(_data, vars) {
      await opts.onSuccess?.(_data)
    },
    async onSettled() {
      await queryCache.invalidateQueries({ key: ['filters'], exact: false })
    },
  })

  return mutation
}

export const useFiltersCopyMutation = (
  opts: { onSuccess?: (filter: ActivityFilter) => Promise<void> | void } = {},
) => {
  const client = useClient()
  const queryCache = useQueryCache()

  const mutation = useMutation({
    mutation: async (filterId: string) => {
      const filters = await client.getFilters()
      const filterToCopy = filters.find(f => f.id === filterId)
      if (!filterToCopy) {
        throw new Error('Filter not found')
      }
      return await client.createFilter(`${filterToCopy.label} (Copy)`)
    },
    async onSuccess(_data, vars) {
      await opts.onSuccess?.(_data)
    },
    async onSettled() {
      await queryCache.invalidateQueries({ key: ['filters'], exact: false })
    },
  })

  return mutation
}
