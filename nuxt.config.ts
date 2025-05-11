import { syncHook } from './server/utils/syncHook'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/mdc',
    'nuxt-auth-utils',
  ],
  imports: {
    autoImport: false,
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  mdc: {
    highlight: {
      shikiEngine: 'oniguruma',
      theme: {
        default: 'material-theme-palenight',
      },
      langs: ['js', 'ts', 'yaml', 'markdown', 'json'],
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',
  hooks: {
    ready: syncHook,
  },
  eslint: {
    config: {
      stylistic: true,
      formatters: true,
    },
  },
})
