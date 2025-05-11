import type { NitroApp } from 'nitropack'

// type stub
// not sure where to import defineNitroPlugin from
type NitroAppPlugin = (nitro: NitroApp) => void

function defineNitroPlugin(def: NitroAppPlugin): NitroAppPlugin {
  return def
}

export default defineNitroPlugin(() => {
  console.log('syncPlugin')
})
