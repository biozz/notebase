import {
  defineQuery,
  useClient,
  useMutation,
  useQuery,
  useQueryCache,
} from '#imports'

import type { ActivityFilter, ActivityFilterFilters } from '~/modules/pocketbase/types/schema'

export const useFiltersListQuery = defineQuery(() => {
  const client = useClient()

  const { state, error, asyncStatus } = useQuery({
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
  opts: { onSuccess?: (filter: { id: string, data: Partial<ActivityFilter> }) => Promise<void> | void } = {},
) => {
  const client = useClient()
  const queryCache = useQueryCache()

  const mutation = useMutation({
    mutation: async ({ id, data }: { id: string, data: Partial<ActivityFilter> }) =>
      await client.updateFilter(id, data),
    async onSuccess(_data, vars) {
      await opts.onSuccess?.(vars)
    },
    async onSettled() {
      await queryCache.invalidateQueries({ key: ['filters'], exact: false })
    },
  })

  return mutation
}

export const useFiltersCreateMutation = (
  opts: { onSuccess?: (data: ActivityFilter, vars: { label: string, filters?: Partial<ActivityFilterFilters>[] }) => Promise<void> | void } = {},
) => {
  const client = useClient()
  const queryCache = useQueryCache()

  const mutation = useMutation({
    mutation: async (payload: { label: string, filters?: Partial<ActivityFilterFilters>[] }) => await client.createFilter(payload.label, payload.filters),
    async onSuccess(data, vars) {
      await opts.onSuccess?.(data, vars)
    },
    async onSettled() {
      await queryCache.invalidateQueries({ key: ['filters'], exact: false })
    },
  })

  return mutation
}

export function useFiltersDeleteMutation(opts: { onSuccess?: (id: string) => Promise<void> | void } = {}) {
  const client = useClient()
  const queryCache = useQueryCache()

  const mutation = useMutation({
    mutation: async (id: string) => await client.deleteFilter(id),
    async onSuccess(data, vars) {
      await opts.onSuccess?.(vars)
    },
    async onSettled() {
      await queryCache.invalidateQueries({ key: ['filters'], exact: false })
    },
  })

  return mutation
}
