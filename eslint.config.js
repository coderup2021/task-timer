// @ts-check
const lightwing = require('@lightwing/eslint-config').default

module.exports = lightwing({
  ignores: [
    'dist',
    'node_modules',
    '*.svelte',
    '*.snap',
    'coverage',
    'js_test',
    'local-data',
  ],
  rules: {
    'no-console': 'off',
    'ts/no-empty-object-type': 'off',
    '--no-ignore': 'off',
  },
})
