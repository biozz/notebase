<script lang="ts" setup generic="T extends Item">
import { resolveDynamicComponent } from 'vue'
import type { Item } from '#imports'

const { item, isList } = defineProps<{ item: T, isList: boolean }>()

const itemComponent = resolveDynamicComponent('item-' + item.type)
</script>

<template>
  <component
    :is="itemComponent"
    :item="item"
    :is-list="isList"
  />
</template>
