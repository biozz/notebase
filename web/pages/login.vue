<script lang="ts" setup>
import { onMounted, reactive } from 'vue'
import { navigateTo } from '#app'
import { definePageMeta, shallowRef, useClient, useToast } from '#imports'

definePageMeta({
  layout: 'empty',
})

const state = reactive({
  email: '',
  password: '',
  isLoading: false,
})

const isAuthorized = shallowRef(false)

const pb = useClient()

const toast = useToast()

const onSignIn = async () => {
  if (!state.email || !state.password) {
    toast.add({
      title: 'Authentication Required',
      description: 'Please enter both email and password',
      color: 'error',
    })
    return
  }

  state.isLoading = true

  try {
    await pb.authenticatedUser({ email: state.email, password: state.password })
    isAuthorized.value = true
    if (await pb.isAuthenticated()) {
      await navigateTo({ name: 'index' })
    }
  }
  catch {
    toast.add({
      title: 'Login Failed',
      description: 'Invalid credentials. Please try again.',
      color: 'error',
    })
  }
  finally {
    state.isLoading = false
  }
}

const onSignOut = async () => {
  await pb.clearAuth()
  isAuthorized.value = false
}

onMounted(async () => {
  if (await pb.isAuthenticated()) {
    isAuthorized.value = true
  }
})
</script>

<template>
  <UContainer class="min-h-dvh flex items-center justify-center p-4">
    <div class="relative w-full max-w-md ">
      <UCard class=" backdrop-blur-sm ring-1 ring-(--ui-border) shadow-purple-500/10 shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <UIcon
              name="i-lucide-notebook"
              class="w-8 h-8"
            />
          </div>
          <h1 class="text-3xl font-bold  mb-2">
            Notebase
          </h1>
        </div>

        <UForm
          v-if="!isAuthorized"
          :state="state"
          class="space-y-6"
          @submit="onSignIn"
        >
          <p class="text-dimmed text-balance">
            Welcome back! Please sign in to continue.
          </p>
          <UFormField
            label="Email Address"
            name="email"
          >
            <UInput
              v-model="state.email"
              type="email"
              placeholder="Enter your email"
              class="w-full"
              size="lg"
              :disabled="state.isLoading"
            />
          </UFormField>

          <UFormField
            label="Password"
            name="password"
          >
            <UInput
              v-model="state.password"
              type="password"
              placeholder="Enter your password"
              class="w-full"
              size="lg"
              :disabled="state.isLoading"
            />
          </UFormField>

          <UButton
            type="submit"
            variant="solid"
            color="primary"
            size="lg"
            block
            :loading="state.isLoading"
            :disabled="state.isLoading"
            class="!bg-gradient-to-r !from-blue-500 !to-purple-600 hover:!from-blue-600 hover:!to-purple-700 !border-0 !shadow-lg hover:!shadow-xl transition-all duration-200"
          >
            <template v-if="!state.isLoading">
              Sign In
            </template>
            <template v-else>
              Signing In...
            </template>
          </UButton>
        </UForm>
        <div
          v-else
          class="space-y-6 text-center"
        >
          <p class="text-dimmed text-balance">
            You are already signed in.
          </p>
          <UButton
            type="submit"
            class="!bg-gradient-to-r !from-red-500 !to-purple-600 hover:!from-red-600 hover:!to-purple-700 !border-0 !shadow-lg hover:!shadow-xl transition-all duration-200"
            size="lg"
            block
            @click="onSignOut"
          >
            Sign out
          </UButton>
        </div>
      </UCard>

      <p class="text-center text-dimmed text-xs text-balance pt-8">
        By signing in, you agree to our
        <ULink
          href="#"
          class="underline"
        >Terms of Service</ULink>
        and
        <ULink
          href="#"
          class="underline"
        >Privacy Policy</ULink>
      </p>
    </div>
  </UContainer>
</template>
