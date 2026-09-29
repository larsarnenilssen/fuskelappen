import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import protokollen from './eslint/regler.js';

export default tseslint.config(
  { ignores: ['dist/', 'dist-e2e/', '.generert/', 'node_modules/', 'playwright-report/', 'test-results/', 'public/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'off',
    },
  },
  {
    files: ['src/**/*.tsx'],
    plugins: { protokollen },
    rules: { 'protokollen/ingen-tekst-i-jsx': 'error' },
  },
);
