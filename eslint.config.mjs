import { createRequire } from 'module';
const cjsRequire = createRequire(import.meta.url);
const eslintPluginAstro = cjsRequire('eslint-plugin-astro');
const tsParser = cjsRequire('@typescript-eslint/parser');

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...eslintPluginAstro.configs['flat/recommended'],
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
