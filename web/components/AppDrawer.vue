<script lang="ts" setup>
import { navigateTo, useClient, useNotebaseConfig, useToast, useUser } from '#imports'

import { ref } from 'vue'

const notebaseConfig = useNotebaseConfig()

const open = ref(false)

const pb = useClient()
const user = useUser()
const toast = useToast()

const onLogout = async () => {
  await pb.clearAuth()
  user.value.isAuthenticated = false
  await navigateTo({ name: 'login' })
}

const restartSync = async () => {
  await pb.restartSync()
  toast.add({ title: 'Restart complete' })
}

const closeSlideover = () => {
  open.value = false
}

const openSlideover = () => {
  open.value = true
}

const navigationItems = ref([
  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/',
    onSelect: closeSlideover,
  },
  {
    label: 'Profile',
    icon: 'i-lucide-user',
    to: '/profile',
    onSelect: closeSlideover,
  },
])
</script>

<template>
  <USlideover
    v-model:open="open"
    side="left"
    :ui="{
      content: 'max-w-[250px]',
    }"
    @after:leave="closeSlideover"
  >
    <UButton
      icon="i-lucide-menu"
      color="neutral"
      variant="subtle"
      block
      class="w-16"
      @click="openSlideover"
    />

    <template #title>
      <div class="flex items-center gap-2">
        <ULink to="/">
          Notebase
        </ULink>
      </div>
    </template>
    <template #close>
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        class="ml-auto"
        @click="closeSlideover"
      />
    </template>
    <template #description>
      Your notes, your way!
    </template>
    <template #body>
      <div class="flex flex-col gap-2 h-full">
        <UNavigationMenu

          :items="navigationItems"
          orientation="vertical"
        />

        <USeparator class="my-2" />

        <div class="flex flex-col gap-2 mt-auto">
          <UButton @click="restartSync">
            Restart sync
          </UButton>
          <UCheckbox
            v-model="notebaseConfig.config.value.showExtra"
            label="Show extra"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-col gap-2 pb-4">
        <UButton
          to="/profile"
          class="flex items-center gap-2 text-text"
          variant="ghost"
        >
          <UIcon
            name="i-lucide-user"
            size="16"
          />
          <span>
            user@user.com
          </span>
        </UButton>
        <UButton
          color="error"
          variant="ghost"
          label="Logout"
          icon="i-lucide-log-out"
          @click="onLogout"
        />
      </div>
    </template>
  </USlideover>
</template>
