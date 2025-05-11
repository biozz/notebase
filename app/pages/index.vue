<script setup lang="ts">
import { onMounted } from 'vue'
import { useActivitiesStore, definePageMeta } from '#imports'

definePageMeta({
  middleware: ['auth'],
})

const activitiesStore = useActivitiesStore()

onMounted(async () => {
  await activitiesStore.load()
})
</script>

<template>
  <div>
    <AppFilters />
    <UCard
      v-for="item in activitiesStore.items"
      :key="item.id"
      class="mt-4"
    >
      <LazyListItem :item="item" />
    </UCard>
  </div>
</template>
