<script setup lang="ts">
import { UCollapsible } from '#components'
import { definePageMeta, useNotebaseConfig } from '#imports'
import { useActivitiesListQuery } from '~/composables/queries/'

definePageMeta({
  middleware: ['auth'],
})
const notebaseConfig = useNotebaseConfig()
const { state, error, asyncStatus } = useActivitiesListQuery()
</script>

<template>
  <div class="flex flex-col">
    <QueryFiltersTabs />
    <div class="pt-2 flex flex-col gap-2">
      <UCollapsible
        :open="notebaseConfig.config.value.showTabsSorting"
      >
        <template #content>
          <QueryFiltersSorting />
        </template>
      </UCollapsible>
      <UCollapsible
        :open="notebaseConfig.config.value.showFilters"
      >
        <template #content>
          <QueryFilterForm />
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
  </div>
</template>
