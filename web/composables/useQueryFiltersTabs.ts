import { useFiltersStore } from '~/stores/filters'
import { computed, ref, type Ref, nextTick } from 'vue'
import { useFiltersCreateMutation, useFiltersDeleteMutation, useFiltersUpdateMutation } from './queries/useFiltersQuery'
import type { FilterForm } from '~/components/QueryFilterForm.vue'

export function useQueryFiltersTabs(sortableContainer: Ref<HTMLElement | null>) {
  const filtersStore = useFiltersStore()
  const showForm = ref(false)
  const { mutateAsync: createFilter } = useFiltersCreateMutation({
    onSettled: (data) => {
      if (data) {
        scrollToFilter(data.id)
      }
    },
  })
  async function handleCreateFilter() {
    const newFilter = await createFilter({ label: `New ${filtersStore.filtersState.data?.length ?? 0 + 1}` })
    filtersStore.setActiveFilterId(newFilter.id)
    showForm.value = true
  }

  async function handleCopyFilter(payload: FilterForm) {
    const res = await createFilter({ label: `${payload.label} (copy)`, filters: payload.filters })
    filtersStore.setActiveFilterId(res.id)
  }

  const isFilterFormOpen = computed(() => {
    return showForm.value
  })

  function toggleShowForm(id: string | undefined) {
    filtersStore.setActiveFilterId(id)
    showForm.value = !showForm.value
  }

  const deleteModal = ref(false)

  const { mutateAsync: deleteFilter, asyncStatus: deleteAsyncStatus } = useFiltersDeleteMutation({
    onSuccess: async () => {
      deleteModal.value = false
      filtersStore.setActiveFilterId(undefined)
    },
  })
  async function handleDeleteFilter(id: string | undefined) {
    if (!id) {
      return
    }
    await deleteFilter(id)
    filtersStore.clearActiveFilter()
    showForm.value = false
  }

  const { mutateAsync: updateFilter } = useFiltersUpdateMutation()
  async function handleUpdateFilter(id: string, data: FilterForm) {
    await updateFilter({ id, data: {
      label: data.label,
      filters: data.filters.map(filter => ({
        type: filter.type,
        value: filter.value ?? '',
        enabled: filter.enabled,
      })),
    } })
  }

  function clearActiveFilter() {
    filtersStore.clearActiveFilter()
    showForm.value = false
  }

  async function scrollToFilter(id: string) {
    await nextTick()
    if (sortableContainer.value) {
      const filterElement = sortableContainer.value.querySelector(`[data-filter-id="${id}"]`)
      if (filterElement) {
        const containerRect = sortableContainer.value.getBoundingClientRect()
        const elementRect = filterElement.getBoundingClientRect()
        const scrollLeft = sortableContainer.value.scrollLeft + (elementRect.left - containerRect.left) - (containerRect.width / 2) + (elementRect.width / 2)

        sortableContainer.value.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        })
      }
    }
  }

  return {
    showForm,
    isFilterFormOpen,
    toggleShowForm,
    deleteModal,
    deleteAsyncStatus,
    handleDeleteFilter,
    handleUpdateFilter,
    handleCreateFilter,
    clearActiveFilter,
    handleCopyFilter,
  }
}
