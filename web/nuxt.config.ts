export default defineNuxtConfig({
  modules: ['@vueuse/nuxt', '@pinia/nuxt', '@nuxt/eslint', '@nuxt/ui'],
  ssr: false,
  imports: {
    autoImport: false,
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  router: {
    options: {
      hashMode: true,
    },
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://127.0.0.1:8090', // NUXT_PUBLIC_API_BASE=/ in production
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',
  nitro: {
    output: {
      // { dir: '.output', serverDir: '.output/server', publicDir: '.output/public' }
      publicDir: '../pb_public',
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
