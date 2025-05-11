import { defineNuxtPlugin } from '#app'
import { ItemDebt, ItemTrack } from '#components'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('item-debt', ItemDebt)
  nuxtApp.vueApp.component('item-track', ItemTrack)
})
