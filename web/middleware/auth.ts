import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { usePocketBase } from '~/utils/pb'

export default defineNuxtRouteMiddleware(() => {
  const pb = usePocketBase()
  if (!pb.authStore.isValid) {
    return navigateTo({ name: 'login' })
  }
})
