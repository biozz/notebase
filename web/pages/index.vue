<script setup lang="ts">
import { useActivitiesStore, definePageMeta } from "#imports";
import { onMounted } from "vue";
import BaseItemComponent from "~/components/BaseItemComponent.vue";

definePageMeta({
  middleware: ["auth"],
});

const activitiesStore = useActivitiesStore();

onMounted(async () => {
  await activitiesStore.load();
});
</script>

<template>
  <div>
    <UInput
      icon="i-lucide-search"
      size="xl"
      variant="outline"
      placeholder="Query"
      class="w-full"
      v-model="activitiesStore.query"
    />

    <UCard v-for="item in activitiesStore.items" :key="item.id" class="mt-4">
      <UCheckbox>
        <template v-slot:label>
          <ULink :to="{ name: 'items-id', params: { id: item.id } }">
            {{ item.title }}
          </ULink>
        </template>
      </UCheckbox>
      <BaseItemComponent :item="item" is-list />
    </UCard>
  </div>
</template>
