import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { pb } from '#imports'

export default defineNuxtRouteMiddleware(() => {
  if (!pb.authStore.isValid) {
    return navigateTo({ name: 'login' })
  }
})
