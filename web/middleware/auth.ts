import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp } from '#app'


export default defineNuxtRouteMiddleware(() => {
  const { $pb } = useNuxtApp()
  if (!$pb.client.authStore.isValid) {
    return navigateTo({ name: 'login' })
  }
})
