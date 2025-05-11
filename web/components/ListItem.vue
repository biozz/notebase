<script setup lang="ts" generic="T extends Item">
import { ref, toggleItem, watch, type Item } from '#imports'
import { LazyBaseItem } from '#components'

const { item } = defineProps<{ item: T }>()

const checked = ref(item.done)

watch(checked, (value) => {
  if (!value) {
    toggleItem(item.id)
    return
  }
  // TODO: add precheck state with timeout
  // ex. setTimeout(() => toggleItem(item.id), 1000)
  // but also handle the intermeditate stat of the checkbox
  toggleItem(item.id)
})
</script>

<template>
  <UCheckbox v-model="checked">
    <template #label>
      <ULink :to="{ name: 'items-id', params: { id: item.id } }">
        {{ item.title }}
      </ULink>
    </template>
  </UCheckbox>
  <LazyBaseItem
    :item="item"
    is-list
    class="ml-6"
  />
</template>
