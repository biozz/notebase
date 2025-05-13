// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'import/first': 'off',
    'import/order': 'off',
    'vue/multi-word-component-names': 'off',
  },
})
