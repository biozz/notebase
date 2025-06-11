<script setup lang="ts">
import { defineShortcuts, ref, useTemplateRef } from '#imports'

// const filtersStore = useFiltersStore()

const input = useTemplateRef('input')

const query = ref('')
const queryType = ref('FTS')

defineShortcuts({
  '/': () => {
    input.value?.inputRef?.focus()
  },
})
</script>

<template>
  <div>
    <UButtonGroup class="w-full">
      <AppDrawer />
      <UInput
        ref="input"
        v-model="query"
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
            v-if="query.length"
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-circle-x"
            aria-label="Clear input"
            @click="query = ''"
          />
          <UKbd value="/" />
        </template>
      </UInput>
      <USelectMenu
        v-model="queryType"
        :items="['FTS', 'QL']"
      />
    </UButtonGroup>
  </div>
</template>
