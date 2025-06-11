import { defineStore } from 'pinia'
import { useLocalStorage, useStorage, watchDebounced } from '@vueuse/core'

import { useNotebaseConfig, computed, ref, reactive } from '#imports'
import { nanoid } from 'nanoid'
import { useFiltersListQuery } from '~/composables/queries/useFiltersQuery'
import type { ActivityFilter } from '#pocketbase-imports'

interface Filter {
  id: string
  label: string
  query: string
  queryType: string
  pathFilter: string
  typeFilter: string
  pathFilterEnabled: boolean
  typeFilterEnabled: boolean
}

const useFiltersLocalStorage = () => useLocalStorage<Filter[]>(
  'notebase-saved-filters',
  () => [],
)

function buildQuery(query: string, filters: ActivityFilter) {
  // `deleted` is a soft-delete indicator
  // this will avoid duplicates on frontend
  const filterParts: string[] = ['deleted = null']

  // Filter processors for different types - easily extensible
  const filterProcessors = {
    type: (value: string) => `frontmatter.type = '${value}'`,
    path: (value: string) => `path ~ '${value}'`,
  } as const

  // Process each filter in the array (with null check)
  if (filters.filters) {
    filters.filters.forEach((filter) => {
      if (!filter.enabled || !filter.value) return

      const processor = filterProcessors[filter.type]
      if (processor) {
        filterParts.push(processor(filter.value))
      }
    })
  }

  // Add query-based filters if query exists
  if (query.length > 0) {
    // For now, defaulting to FTS since queryType is not in the new schema
    // This can be extended if queryType becomes part of the filter schema
    filterParts.push(`(content~'${query}'||frontmatter.summary~'${query}'||frontmatter.title~'${query}')`)
  }

  return filterParts.join(' && ')
}

export const useFiltersStore = defineStore('filters', () => {
  const queryStore = reactive({ query: '' })
  const { state: filtersState } = useFiltersListQuery()

  const activeFilterId = ref<string>()

  function setActiveFilterId(id: string | undefined) {
    activeFilterId.value = id
  }

  const activeFilter = computed(() => {
    return filtersState.value.data?.find(f => f.id === activeFilterId.value)
  })

  const builtQuery = computed(() => {
    if (!activeFilter.value) {
      return ''
    }
    return buildQuery(queryStore.query, activeFilter.value)
  })

  function clearActiveFilter() {
    setActiveFilterId(undefined)
  }

  return {
    activeFilter,
    filtersState,
    builtQuery,

    //
    setActiveFilterId,
    clearActiveFilter,
  }
})

export const _useFiltersStore = defineStore('filters', () => {
  const notebaseConfig = useNotebaseConfig()

  const localFilters = useFiltersLocalStorage()

  const query = useStorage('query', '', localStorage)
  const queryType = useStorage('query-type', 'FTS', localStorage)
  const pathFilter = useStorage('path-filter', '', localStorage)
  const typeFilter = useStorage('type-filter', '', localStorage)
  const pathFilterEnabled = useStorage('path-filter-enabled', false, localStorage)
  const typeFilterEnabled = useStorage('type-filter-enabled', false, localStorage)

  const appliedFilterId = ref<string>()

  const builtQuery = ref('')

  const saveFilterLabel = ref<string>('')

  const enabled = ref(false)

  function buildQuery() {
    // `deleted` is a soft-delete indicator
    // this will avoid duplicates on frontend
    const filterParts: string[] = ['deleted = null']
    if (typeFilterEnabled.value && typeFilter.value.length > 0) {
      filterParts.push(`frontmatter.type = '${typeFilter.value}'`)
    }
    if (pathFilterEnabled.value && pathFilter.value.length > 0) {
      filterParts.push(`path ~ '${pathFilter.value}'`)
    }
    if (query.value.length > 0) {
      if (queryType.value === 'FTS') {
        filterParts.push(`(content~'${query.value}'||frontmatter.summary~'${query.value}'||frontmatter.title~'${query.value}')`)
      }
      else if (queryType.value === 'QL') {
        filterParts.push(query.value)
      }
    }
    return filterParts.join(' && ')
  }

  function saveFilter() {
    const id = nanoid()
    if (!saveFilterLabel.value) {
      return
    }
    const filter: Filter = {
      id,
      label: saveFilterLabel.value,
      query: query.value,
      queryType: queryType.value,
      pathFilter: pathFilter.value,
      typeFilter: typeFilter.value,
      pathFilterEnabled: pathFilterEnabled.value,
      typeFilterEnabled: typeFilterEnabled.value,
    }
    if (appliedFilterId.value) {
      const appliedFilterIndex = localFilters.value.findIndex(f => f.id === appliedFilterId.value)
      if (appliedFilterIndex !== -1) {
        localFilters.value[appliedFilterIndex] = { ...filter, id: appliedFilterId.value }
      }
    }
    else {
      localFilters.value.push(filter)
      clearForm()
    }
    notebaseConfig.setShowFilters(false)
    return filter
  }

  function copyFilter() {
    if (!appliedFilterId.value) {
      return false
    }

    const currentFilter = localFilters.value.find(f => f.id === appliedFilterId.value)
    if (!currentFilter) {
      return false
    }

    const id = nanoid()
    const copiedFilter: Filter = {
      id,
      label: `${currentFilter.label} (Copy)`,
      query: query.value,
      queryType: queryType.value,
      pathFilter: pathFilter.value,
      typeFilter: typeFilter.value,
      pathFilterEnabled: pathFilterEnabled.value,
      typeFilterEnabled: typeFilterEnabled.value,
    }

    localFilters.value.push(copiedFilter)

    appliedFilterId.value = id
    saveFilterLabel.value = copiedFilter.label

    return copiedFilter
  }

  function clearForm() {
    saveFilterLabel.value = ''
  }

  function applyFilter(id: string) {
    const filter = localFilters.value.find(f => f.id === id)
    if (!filter) return false

    appliedFilterId.value = id
    saveFilterLabel.value = filter.label
    query.value = filter.query
    queryType.value = filter.queryType
    pathFilter.value = filter.pathFilter
    typeFilter.value = filter.typeFilter
    pathFilterEnabled.value = filter.pathFilterEnabled
    typeFilterEnabled.value = filter.typeFilterEnabled

    return true
  }

  function clearFilters() {
    saveFilterLabel.value = ''
    query.value = ''
    pathFilter.value = ''
    typeFilter.value = ''
    pathFilterEnabled.value = false
    typeFilterEnabled.value = false
    appliedFilterId.value = undefined
  }

  function deleteFilter(id: string) {
    const index = localFilters.value.findIndex(f => f.id === id)
    if (index !== -1) {
      localFilters.value.splice(index, 1)
      clearFilters()
      notebaseConfig.setShowFilters(false)
      return true
    }
    return false
  }

  watchDebounced(
    [query, pathFilter, typeFilter, pathFilterEnabled, typeFilterEnabled],
    () => {
      if (!enabled.value) {
        enabled.value = true
      }
      builtQuery.value = buildQuery()
    },
    { debounce: 300, immediate: true },
  )

  return {
    // refs
    query,
    queryType,
    pathFilter,
    typeFilter,
    pathFilterEnabled,
    typeFilterEnabled,
    builtQuery,
    enabled,
    saveFilterLabel,
    appliedFilterId,

    // functions
    buildQuery,
    saveFilter,
    copyFilter,
    applyFilter,
    clearFilters,
    deleteFilter,

    // local storage
    localFilters,
  }
})
