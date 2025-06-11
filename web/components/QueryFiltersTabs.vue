<script lang="ts" setup>
import { ref } from 'vue'
import { useFiltersCreateMutation } from '~/composables/queries/useFiltersQuery'
import { useFiltersStore } from '~/stores/filters'

const filtersStore = useFiltersStore()
const { mutateAsync: createFilter } = useFiltersCreateMutation()
async function handleCreateFilter() {
  const newFilter = await createFilter({ label: `New ${filtersStore.filtersState.data?.length ?? 0 + 1}` })
  filtersStore.setActiveFilterId(newFilter.id)
}

const deleteModal = ref(false)

const showForm = defineModel<boolean>('form-open')
function toggleShowForm(id: string | undefined) {
  filtersStore.setActiveFilterId(id)
  showForm.value = !showForm.value
}

function handleClearActiveFilter() {
  filtersStore.clearActiveFilter()
  showForm.value = false
}
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center relative min-h-12">
      <div class="flex gap-1 items-center bg-(--ui-bg)">
        <UButton
          color="neutral"
          :variant="!filtersStore.activeFilter ? 'solid' : 'ghost'"
          icon="i-lucide-filter-x"
          block
          @click="handleClearActiveFilter"
        />
      </div>
      <div
        ref="sortableContainer"
        class="scrollable flex items-center w-full overflow-x-auto"
      >
        <div v-if="filtersStore.filtersState.status === 'pending'">
          Loading filters...
        </div>
        <div
          v-else-if="filtersStore.filtersState.status === 'success'"
          class="flex gap-2 pl-2 py-1"
        >
          <template v-if="filtersStore.filtersState.data.length > 0">
            <UButtonGroup
              v-for="filter in filtersStore.filtersState.data"
              :key="filter.id"
              :data-filter-id="filter.id"
              class="rounded-md"
            >
              <UButton
                :label="filter.label"
                color="neutral"
                :variant="filtersStore.activeFilter?.id === filter.id ? 'solid' : 'ghost'"
                class="w-full truncate"
                @click="filtersStore.setActiveFilterId(filter.id)"
              >
                {{ filter.label }}
              </UButton>
              <UButton
                color="neutral"
                variant="ghost"
                :icon="showForm && filtersStore.activeFilter?.id === filter.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                @click="toggleShowForm(filter.id)"
              />
            </UButtonGroup>
          </template>
          <template v-else>
            <span class="text-xs text-dimmed">
              No filters
            </span>
          </template>
        </div>
      </div>
      <div class="flex items-center gap-0.5">
        <UButton
          color="neutral"
          variant="outline"
          block
          icon="i-lucide-plus"
          @click="handleCreateFilter"
        />
      </div>
    </div>
    <UModal
      v-model:open="deleteModal"
      :dismissible="false"
    >
      <template #title>
        Delete filter
      </template>
      <template #description>
        Are you sure you want to delete this filter?
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton
            color="neutral"
            variant="soft"
            @click="deleteModal = false"
          >
            Cancel
          </UButton>
          <UButton
            color="error"
            @click="() => {}"
          >
            Delete
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.scrollable {
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
