import { defineStore } from 'pinia'

import { computed, ref, refDebounced } from '#imports'
import { useFiltersListQuery } from '~/composables/queries/useFiltersQuery'
import type { ActivityFilter } from '#pocketbase-imports'

function buildQuery(query?: string, filters?: ActivityFilter | undefined) {
  // `deleted` is a soft-delete indicator
  // this will avoid duplicates on frontend
  const filterParts: string[] = ['deleted = null']

  // Filter processors for different types - easily extensible
  const filterProcessors = {
    type: (value: string) => `frontmatter.type = '${value}'`,
    path: (value: string) => `path ~ '${value}'`,
  } as const

  // Process each filter in the array (with null check)
  if (filters?.filters) {
    filters.filters.forEach((filter) => {
      if (!filter.enabled || !filter.value) return

      const processor = filterProcessors[filter.type]
      if (processor) {
        filterParts.push(processor(filter.value))
      }
    })
  }

  // Add query-based filters if query exists
  if (query?.length) {
    // For now, defaulting to FTS since queryType is not in the new schema
    // This can be extended if queryType becomes part of the filter schema
    filterParts.push(`(content~'${query}'||frontmatter.summary~'${query}'||frontmatter.title~'${query}')`)
  }

  return filterParts.join(' && ')
}

export const useFiltersStore = defineStore('filters', () => {
  const query = ref<string>()
  const queryType = ref<string>()
  const { state: filtersState } = useFiltersListQuery()

  const activeFilterId = ref<string>()

  const debouncedQuery = refDebounced(query, 250)

  const builtQuery = computed(() => {
    return buildQuery(debouncedQuery.value, activeFilter.value)
  })

  const activeFilter = computed(() => {
    return filtersState.value.data?.find(f => f.id === activeFilterId.value)
  })
  function setActiveFilterId(id: string | undefined) {
    activeFilterId.value = id
  }
  function clearActiveFilter() {
    setActiveFilterId(undefined)
  }

  return {
    activeFilter,
    filtersState,
    builtQuery,
    query,
    queryType,

    //
    setActiveFilterId,
    clearActiveFilter,
  }
})
