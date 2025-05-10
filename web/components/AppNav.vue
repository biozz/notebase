<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { navigateTo } from '#app'
import {
  ref,
} from '#imports'
import { usePocketBase } from '~/utils/pb'

const pb = usePocketBase()
const onLogout = async () => {
  pb.authStore.clear()
  await navigateTo({ name: 'login' })
}

const items = ref<NavigationMenuItem[]>([
  [
    {
      label: 'Notebase',
      to: { name: 'index' },
    },
  ],
  [
    {
      label: pb.authStore.isValid ? 'Logout' : 'Login',
      onClick: pb.authStore.isValid
        ? onLogout
        : () => navigateTo({ name: 'login' }),
    },
  ],
])
</script>

<template>
  <UNavigationMenu
    :items="items"
    class="w-full justify-center"
  />
</template>
