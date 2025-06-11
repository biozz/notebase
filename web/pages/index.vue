<script setup lang="ts">
import { UCollapsible } from '#components'
import { computed, definePageMeta, ref, useFiltersStore } from '#imports'
import type { FilterForm } from '~/components/QueryFilterForm.vue'
import { useActivitiesListQuery } from '~/composables/queries/'
import { useFiltersCreateMutation, useFiltersDeleteMutation, useFiltersUpdateMutation } from '~/composables/queries/useFiltersQuery'

definePageMeta({
  middleware: ['auth'],
})
const filtersStore = useFiltersStore()
const { state, error, asyncStatus } = useActivitiesListQuery()

const { mutateAsync: copyFilter } = useFiltersCreateMutation()

async function handleCopyFilter(payload: FilterForm) {
  const res = await copyFilter({ label: `${payload.label} (copy)`, filters: payload.filters })
  filtersStore.setActiveFilterId(res.id)
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
}

const showForm = ref(false)
const isFilterFormOpen = computed(() => {
  return showForm.value
})
</script>

<template>
  <div class="flex flex-col">
    <QueryFiltersTabs v-model:form-open="showForm" />
    <div class="pt-2 flex flex-col gap-2">
      <UCollapsible
        :open="isFilterFormOpen"
      >
        <template #content>
          <QueryFilterForm
            :filter="filtersStore.activeFilter"
            @update-filter="handleUpdateFilter"
            @delete-filter="deleteModal = true"
            @copy-filter="handleCopyFilter"
          />
        </template>
      </UCollapsible>
    </div>
    <div
      v-if="state.status !== 'success' || asyncStatus === 'loading'"
      class="py-2"
    >
      <ItemsListSkeleton />
    </div>
    <div
      v-else-if="state.status === 'success'"
      class="py-2"
    >
      <template v-if="state.data.items.length">
        <ItemsList :items="state.data.items" />
      </template>
      <template v-else>
        <div class="flex flex-col items-center justify-center h-full">
          <p class="text-sm text-dimmed">
            No items found
          </p>
        </div>
      </template>
    </div>
    <div
      v-else
      class="py-2"
    >
      <p class="text-sm text-dimmed">
        Error loading items: {{ error }}
      </p>
    </div>
    <UModal
      v-model:open="deleteModal"
      title="Delete Filter"
      :description="`Are you sure you want to delete the filter ${filtersStore.activeFilter?.label}?`"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="outline"
          :disabled="deleteAsyncStatus === 'loading'"
          @click="deleteModal = false"
        >
          Cancel
        </UButton>
        <UButton
          color="error"
          :loading="deleteAsyncStatus === 'loading'"
          :disabled="deleteAsyncStatus === 'loading'"
          @click="handleDeleteFilter(filtersStore.activeFilter?.id)"
        >
          Delete
        </UButton>
      </template>
    </UModal>
  </div>
</template>
