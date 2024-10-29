const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const nx = require('@nx/eslint-plugin');
const prettier = require('eslint-plugin-prettier');
const TSLint = require('typescript-eslint');

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
    compat.extends(
      'eslint:recommended',
      'plugin:import/warnings',
      'plugin:import/typescript',
      'plugin:prettier/recommended',
    ),
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
          allowCircularSelfDependency: true,
          depConstraints: [
            {
              sourceTag: 'scope:frontend',
              onlyDependOnLibsWithTags: ['scope:frontend', 'scope:shared'],
              bannedExternalImports: ['@nestjs/*'],
            },
            {
              sourceTag: 'scope:backend',
              onlyDependOnLibsWithTags: ['scope:backend', 'scope:shared'],
              bannedExternalImports: ['react*'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', ['parent', 'sibling', 'index']],
          pathGroups: [
            {
              pattern: './*.scss',
              group: 'index',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
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
