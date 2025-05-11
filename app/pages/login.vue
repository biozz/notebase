<script lang="ts" setup>
import { onMounted, reactive } from 'vue'
import { navigateTo } from '#app'
import { useToast } from '#imports'

const state = reactive({
  email: '',
  password: '',
})

const isAuthorized = defineModel('isAuthorized', {
  type: Boolean,
  default: true,
})

function setAuthorized(value: boolean) {
  isAuthorized.value = value
}

const toast = useToast()

const onSubmit = async () => {
  if (!state.email || !state.password) {
    toast.add({
      title: 'Error',
      description: 'Invalid email or password',
      color: 'error',
    })
    return
  }

  try {
    setAuthorized(true)
    await navigateTo({ name: 'index' })
  }
  catch (error) {
    toast.add({
      title: 'Error',
      description: `${error}`,
      color: 'error',
    })
  }
}

onMounted(() => {
  setAuthorized(true)
})
</script>

<template>
  <UForm
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField
      label="Email"
      name="email"
    >
      <UInput v-model="state.email" />
    </UFormField>

    <UFormField
      label="Password"
      name="password"
    >
      <UInput
        v-model="state.password"
        type="password"
      />
    </UFormField>

    <UButton type="submit">
      Submit
    </UButton>
  </UForm>
</template>
