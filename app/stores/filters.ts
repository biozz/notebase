import { defineStore } from 'pinia'
import { useLocalStorage, watchDebounced } from '@vueuse/core'
import { useActivitiesStore } from '#imports'

export const useFiltersStore = defineStore('filters', () => {
  const query = useLocalStorage('query', '')
  const queryType = useLocalStorage('query-type', 'FTS')
  const pathFilter = useLocalStorage('path-filter', '')
  const typeFilter = useLocalStorage('type-filter', '')
  const pathFilterEnabled = useLocalStorage('path-filter-enabled', false)
  const typeFilterEnabled = useLocalStorage('type-filter-enabled', false)

  const activitiesStore = useActivitiesStore()

  const buildQuery = () => {
    const filterParts: string[] = []
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

  watchDebounced(
    [
      query,
      pathFilter,
      typeFilter,
      pathFilterEnabled,
      typeFilterEnabled,
    ],
    async () => {
      await activitiesStore.load()
    },
    { debounce: 300 },
  )

  return {
    query,
    queryType,
    pathFilter,
    typeFilter,
    pathFilterEnabled,
    typeFilterEnabled,
    buildQuery,
  }
})
