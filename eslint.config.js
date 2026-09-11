import js from '@eslint/js';
export default [
  { ignores: ['dist/**', 'node_modules/**', '.wrangler/**', 'apoio/**'] },
  { files: ['shared/**/*.js', 'src/delivery/**/*.js', 'src/marketing/**/*.js', 'functions/**/*.js', 'scripts/*.mjs', 'tests/**/*.mjs'], ...js.configs.recommended,
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: Object.fromEntries(['window','document','URL','URLSearchParams','Blob','Response','Request','TextDecoder','Uint8Array','console','setTimeout','crypto'].map(key=>[key,'readonly'])) },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
];
