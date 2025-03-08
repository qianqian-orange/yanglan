import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      'jsx-quotes': ['error', 'prefer-single'],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
]
