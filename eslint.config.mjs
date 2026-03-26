import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const eslintPluginAstro = require('eslint-plugin-astro');
const tsParser = require('@typescript-eslint/parser');

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      // TS specific rules
    },
  },
  {
    rules: {
      // additional rules
    }
  }
];
