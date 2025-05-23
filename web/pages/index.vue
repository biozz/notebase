<script setup lang="ts">
import { definePageMeta } from '#imports'
import { useActivitiesQuery } from '~/composables/queries/'

definePageMeta({
  middleware: ['auth'],
})

const { state } = useActivitiesQuery()
</script>

<template>
  <div>
    <AppFilters />
    <div v-if="state.status !== 'success'">
      <!-- this can be a skeleton loader -->
      <UProgress indeterminate />
    </div>
    <UCard
      v-for="item in state.data?.items"
      :key="item.id"
      class="mt-4"
    >
      <LazyListItem :item="item" />
    </UCard>
  </div>
</template>
