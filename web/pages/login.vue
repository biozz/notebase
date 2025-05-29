<script lang="ts" setup>
import { onMounted, reactive } from 'vue'
import { navigateTo } from '#app'
import { useClient, useToast } from '#imports'

const state = reactive({
  email: '',
  password: '',
})

const pb = useClient()

const isAuthorized = defineModel('isAuthorized', {
  type: Boolean,
  default: false,
})

async function setAuthorized(value: boolean) {
  if (!value) {
    await pb.clearAuth()
  }
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
    await pb.authenticatedUser({ email: state.email, password: state.password })
    setAuthorized(true)
    if (await pb.isAuthenticated()) {
      await navigateTo({ name: 'index' })
    }
  }
  catch (error) {
    toast.add({
      title: 'Error',
      description: `${error}`,
      color: 'error',
    })
  }
}

onMounted(async () => {
  if (await pb.isAuthenticated()) {
    setAuthorized(true)
  }
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
