<script setup lang="ts">
import { defineShortcuts, useFiltersStore, useTemplateRef } from '#imports'

const filtersStore = useFiltersStore()

const input = useTemplateRef('input')

defineShortcuts({
  '/': () => {
    input.value?.inputRef?.focus()
  },
})
</script>

<template>
  <UButtonGroup class="w-full mb-2">
    <UInput
      ref="input"
      v-model="filtersStore.query"
      icon="i-lucide-search"
      size="xl"
      variant="outline"
      placeholder="Query"
      class="w-full"
      autocapitalize="none"
      autocorrect="off"
    >
      <template #trailing>
        <UButton
          v-if="filtersStore.query.length"
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-circle-x"
          aria-label="Clear input"
          @click="filtersStore.query = ''"
        />
        <UKbd value="/" />
      </template>
    </UInput>
    <USelectMenu
      v-model="filtersStore.queryType"
      :items="['FTS', 'QL']"
    />
  </UButtonGroup>

  <UButtonGroup class="mr-2">
    <UBadge
      color="neutral"
      variant="outline"
      size="lg"
      label="path"
    >
      <UCheckbox v-model="filtersStore.pathFilterEnabled" />
      path
    </UBadge>
    <UInput
      v-model="filtersStore.pathFilter"
      color="neutral"
      variant="outline"
      placeholder="inbox/activities/%"
      autocapitalize="none"
      autocorrect="off"
    />
  </UButtonGroup>

  <UButtonGroup>
    <UBadge
      color="neutral"
      variant="outline"
      size="lg"
      label="type"
    >
      <UCheckbox v-model="filtersStore.typeFilterEnabled" />
      type
    </UBadge>
    <UInput
      v-model="filtersStore.typeFilter"
      color="neutral"
      variant="outline"
      placeholder="debt"
      autocapitalize="none"
      autocorrect="off"
    />
  </UButtonGroup>
</template>
