<script setup lang="ts" generic="T extends Item & { frontmatter: TrackFrontmatter }">
import { ref, type Item, type TrackFrontmatter } from '#imports'
import { incrByStep } from '~/utils/services'

const { item, incrKey } = defineProps<{ item: T, incrKey: string }>()

const num = ref()

if (incrKey === 'season') {
  num.value = item.frontmatter.season
}
if (incrKey === 'episode') {
  num.value = item.frontmatter.episode
}

const incr = (n: number) => {
  incrByStep(item.id, incrKey, n)
}

const onManualChange = () => {
  console.log(num.value)
}
</script>

<template>
  <UButtonGroup class="mr-2">
    <UButton
      color="warning"
      variant="subtle"
      icon="material-symbols:remove"
      @click="() => incr(-1)"
    />
    <UInput
      v-model="num"
      :placeholder="incrKey"
      color="neutral"
      variant="outline"
      type="number"
      class="w-24"
      @change="onManualChange"
    />

    <UButton
      color="success"
      variant="subtle"
      icon="material-symbols:add"
      @click="() => incr(-1)"
    />
  </UButtonGroup>
</template>
