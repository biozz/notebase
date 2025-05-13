<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import { reactive } from '#imports'
import { type FormState, formSchema } from '../ItemDebt.vue'

const emit = defineEmits<{
  (e: 'success', data: FormState): void
}>()

const state = reactive({
  amount: 0,
  comment: '',
})

function onSubmit(event: FormSubmitEvent<FormState>) {
  emit('success', event.data)
}
</script>

<template>
  <UForm
    :state="state"
    :schema="formSchema"
    class="mt-2 flex gap-2"
    @submit="onSubmit"
  >
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
      Add
    </UButton>
  </UForm>
</template>
