/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];

export default config;
