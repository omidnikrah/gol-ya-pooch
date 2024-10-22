const nx = require('@nx/eslint-plugin');

const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');

const prettier = require('eslint-plugin-prettier');
const TSLint = require('typescript-eslint');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = TSLint.config(
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...fixupConfigRules(
    compat.extends('eslint:recommended', 'plugin:prettier/recommended'),
  ),
  {
    plugins: {
      prettier: fixupPluginRules(prettier),
    },
  },
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  TSLint.configs.eslintRecommended,
  ...TSLint.configs.recommended,
);
