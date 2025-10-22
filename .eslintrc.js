module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
  },
  ignorePatterns: ['/dist/*'],
  env: {
    node: true,
  },
  overrides: [
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
