<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import { onMounted, reactive } from '#imports'
import { type FormState, formSchema } from '../ItemDebt.vue'

const { defaults, type = 'add' } = defineProps<{
  defaults?: {
    date?: string
    amount?: number
    comment?: string
  }
  type?: 'add' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'success', data: FormState): void
}>()

const state = reactive<FormState>({
  date: undefined,
  amount: 0,
  comment: undefined,
})

function onSubmit(event: FormSubmitEvent<FormState>) {
  emit('success', event.data)
}

onMounted(() => {
  if (defaults) {
    state.date = defaults.date ?? undefined
    state.amount = defaults.amount ?? 0
    state.comment = defaults.comment ?? undefined
  }
})
</script>

<template>
  <UForm
    :state="state"
    :schema="formSchema"
    class="mt-2 flex gap-2 relative"
    @submit="onSubmit"
  >
    <div class="absolute -top-5 text-xs z-20" />
    <UFormField
      v-if="type === 'edit'"
      name="date"
    >
      <UInput
        v-model="state.date"
        placeholder="Date"
        type="datetime-local"
      />
    </UFormField>
    <UFormField
      name="amount"
    >
      <UInput
        v-model="state.amount"
        placeholder="-20000"
        type="number"
      />
    </UFormField>

    <UFormField
      name="comment"
    >
      <UInput
        v-model="state.comment"
        placeholder="Comment"
        type="text"
      />
    </UFormField>

    <UButton type="submit">
      <slot name="submit">
        Add
      </slot>
    </UButton>
  </UForm>
</template>
