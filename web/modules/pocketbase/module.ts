import { defineNuxtModule, createResolver, addPlugin, addImportsDir } from 'nuxt/kit'
import { defu } from 'defu'
import type { ModuleOptions } from './types/module'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'pocketbase',
    configKey: 'pocketbase',
  },
  defaults: {
    type: 'pb',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const runtimeConfig = defu<ModuleOptions, ModuleOptions[]>(
      nuxt.options.runtimeConfig.pocketbase as ModuleOptions,
      options,
    )

    // Get apiBase from config if url is not provided
    const apiBase = nuxt.options.runtimeConfig.public?.apiBase
    if (!apiBase) {
      console.error('Pocketbase: No URL provided in configuration')
    }
    // Configure runtime config
    nuxt.options.runtimeConfig.public.pocketbase = runtimeConfig

    // Register plugin and composables
    addPlugin(resolve('./runtime/plugin'))
    addImportsDir(resolve('./runtime/composables'))
  },
})

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    pocketbase: ModuleOptions
  }
}

export * from './types'
