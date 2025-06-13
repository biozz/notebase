<script lang="ts">
import { z } from 'zod/v4-mini'
import type { ActivityFilter } from '~/modules/pocketbase/types/types'
import { filterTypes } from '~/modules/pocketbase/types/schema'

export const filterTypePlaceholders: Record<keyof typeof filterTypes, string> = {
  path: 'inbox/activities/%',
  type: 'debt',
}

export const activityFilterFiltersSchema = z.object({
  type: z.enum(Object.values(filterTypes)),
  value: z.optional(z.string()),
  enabled: z.boolean(),
})

export const formSchema = z.object({
  label: z.string().check(
    z.minLength(1),
  ),
  filters: z.array(activityFilterFiltersSchema),
})

export type FilterForm = z.infer<typeof formSchema>

export const defaultFormState = {
  label: '',
  filters: [
    { type: 'path', value: '', enabled: false },
    { type: 'type', value: '', enabled: false },
  ],
} satisfies FilterForm
</script>

<script lang="ts" setup>
import { ref, watch, nextTick, useTemplateRef } from '#imports'

const props = defineProps<{
  filter?: ActivityFilter
}>()
const emits = defineEmits<{
  'update-filter': [id: string, data: FilterForm]
  'copy-filter': [data: FilterForm]
  'delete-filter': [id: string]
  'update': [data: FilterForm]
}>()

const formRef = useTemplateRef('form')
const formState = ref<FilterForm>(defaultFormState)
const isUpdatingFromProps = ref(false)

watch(formState, async (newVal) => {
  if (!isUpdatingFromProps.value) {
    const validationResult = await formRef.value?.validate({ silent: true })
    if (validationResult !== false) {
      emits('update', newVal)
    }
  }
}, { deep: true })

function copyFilter(id: string | undefined) {
  if (!id) {
    return
  }
  emits('copy-filter', formState.value)
}
function deleteFilter(id: string | undefined) {
  if (!id) {
    return
  }
  emits('delete-filter', id)
}

watch(() => props.filter, (newVal) => {
  isUpdatingFromProps.value = true
  formState.value = {
    label: newVal?.label || defaultFormState.label,
    filters: newVal?.filters || defaultFormState.filters,
  }
  nextTick(() => {
    isUpdatingFromProps.value = false
  })
}, { immediate: true })
</script>

<template>
  <UForm
    ref="form"
    :state="formState"
    :schema="formSchema"
    class="flex flex-col gap-2 w-full"
  >
    <UForm
      v-for="filter in formState.filters"
      :key="filter.type"
      :state="filter"
      :schema="activityFilterFiltersSchema"
      class="flex items-center gap-2 w-full"
    >
      <UFormField
        v-if="false"
        name="type"
      >
        <UInput
          :model-value="filter.type"
          disabled
          class="w-full"
        />
      </UFormField>

      <UFormField
        name="enabled"
        class="p-1.5 rounded-md"
        :class="{
          'bg-elevated/50': filter.enabled,
        }"
      >
        <UCheckbox
          v-model="filter.enabled"
          :label="filter.type"
          size="lg"
        />
      </UFormField>

      <UFormField
        name="value"
        class="w-full"
      >
        <UInput
          v-model="filter.value"
          color="neutral"
          variant="outline"
          :placeholder="filterTypePlaceholders[filter.type]"
          autocapitalize="none"
          autocorrect="off"
          class="w-full"
        />
      </UFormField>
    </UForm>
    <div class="flex gap-2 items-start">
      <UFormField
        name="label"
        class="w-full pt-0.5"
      >
        <UInput
          v-model="formState.label"
          placeholder="Filter label"
          type="text"
          class="w-full"
        />
      </UFormField>
      <div>
        <UButtonGroup>
          <UButton
            variant="soft"
            icon="i-lucide-copy"
            size="lg"
            @click="copyFilter(props.filter?.id)"
          />
          <UButton
            variant="soft"
            color="error"
            size="lg"
            icon="i-lucide-trash"
            @click="deleteFilter(props.filter?.id)"
          />
        </UButtonGroup>
      </div>
    </div>
  </UForm>
</template>
