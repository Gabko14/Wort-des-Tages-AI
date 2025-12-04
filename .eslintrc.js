module.exports = {
  extends: ['expo', 'plugin:prettier/recommended'],
  plugins: ['import'],
  rules: {
    'prettier/prettier': ['warn', { endOfLine: 'auto' }],

    // Import-Sortierung
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: 'react-native',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react', 'react-native'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  ignorePatterns: ['/dist/*'],
  env: {
    node: true,
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  overrides: [
    // TypeScript-Dateien: Naming Conventions
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'warn',
          // Variablen: camelCase oder UPPER_CASE oder PascalCase (für Komponenten)
          {
            selector: 'variable',
            format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          },
          // Funktionen: camelCase oder PascalCase (für Komponenten)
          {
            selector: 'function',
            format: ['camelCase', 'PascalCase'],
          },
          // Typen & Interfaces: PascalCase
          {
            selector: 'typeLike',
            format: ['PascalCase'],
          },
        ],
      },
    },
    // Test-Dateien
    {
      files: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
        'jest-setup.js',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
