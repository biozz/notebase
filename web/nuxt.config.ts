export default defineNuxtConfig({
  modules: ['@vueuse/nuxt', '@pinia/nuxt', '@nuxt/eslint', '@nuxt/ui'],
  ssr: false,

  imports: {
    autoImport: false,
  },
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css',
        },
      ],
    },
  },
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
