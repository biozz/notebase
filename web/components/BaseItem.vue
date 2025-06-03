<script lang="ts">
export type BaseItemEmits = {
  updateFrontmatter: [payload: ItemRecord]
}

export interface BaseItemProps {
  item: ItemRecord
  compact?: boolean
  loading?: boolean
  disabled?: boolean
}
</script>

<script lang="ts" setup>
import { computed, resolveDynamicComponent } from 'vue'
import type { ItemRecord } from '#pocketbase-imports'
import { useActivitiesUpdateItemMutation } from '~/composables/queries'
import { itemTypes } from '~/modules/pocketbase/types/schema'

const props = defineProps<BaseItemProps>()

const itemType = computed(() => {
  if (Object.keys(itemTypes).includes(props.item?.frontmatter?.type ?? 'none')) {
    return props.item?.frontmatter?.type
  }
  return itemTypes.none
})

const itemComponent = computed(() => {
  const componentName = `item-${itemType.value}`
  try {
    return resolveDynamicComponent(componentName)
  }
  catch (error) {
    console.warn(`Component for type "${itemType.value}" not found, falling back to default`)
    return resolveDynamicComponent('item-none')
  }
})

const hasValidItem = computed(() => {
  return props.item && props.item.id && props.item.frontmatter
})

const { mutateAsync, asyncStatus } = useActivitiesUpdateItemMutation()

async function updateFrontmatter(payload: ItemRecord) {
  await mutateAsync(payload)
}
</script>

<template>
  <ItemEmpty
    v-if="!hasValidItem"
    :item="item"
    :loading="loading || asyncStatus === 'loading'"
    :disabled="disabled || asyncStatus === 'loading'"
    @update-frontmatter="updateFrontmatter"
  />

  <component
    :is="itemComponent"
    v-else
    :item="item"
    :compact="compact"
    :loading="loading || asyncStatus === 'loading'"
    :disabled="disabled || asyncStatus === 'loading'"
    @update-frontmatter="updateFrontmatter"
  />
</template>
