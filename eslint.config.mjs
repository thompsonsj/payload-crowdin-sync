import nx from '@nx/eslint-plugin';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/build/**',
      '**/next-env.d.ts',
    ],
  },
  ...nx.configs['flat/base'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
          ],
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
  ...nx.configs['flat/typescript'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-extra-semi': 'error',
      // Newly enforced by ESLint v9 recommended; was not configured before the upgrade.
      'no-unsafe-optional-chaining': 'off',
    },
  },
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      'no-extra-semi': 'error',
    },
  },
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.spec.js',
      '**/*.spec.jsx',
      '**/*.test.ts',
      '**/*.test.tsx',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Translation fixtures may include French narrow no-break spaces (U+00A0).
      'no-irregular-whitespace': 'off',
    },
  },
];
