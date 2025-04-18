/**
 * ESLint Configuration
 *
 * This configuration is designed for the Vectorbit project to enforce
 * code quality standards and best practices.
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'import', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
        paths: ['src'],
      },
    },
  },
  rules: {
    // Code Style (working with Prettier)
    'prettier/prettier': ['error'],

    // General JavaScript best practices
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'default-case': 'error',
    'no-fallthrough': 'error',
    'no-duplicate-imports': 'error',

    // Early returns and clarity
    'no-else-return': 'error',
    'no-nested-ternary': 'error',
    'max-depth': ['warn', 4],
    'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],

    // React specific rules
    'react/prop-types': 'error',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/self-closing-comp': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/jsx-pascal-case': 'error',
    'react/jsx-sort-props': [
      'warn',
      {
        callbacksLast: true,
        shorthandFirst: true,
        ignoreCase: true,
        reservedFirst: true,
      },
    ],

    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Accessibility
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/tabindex-no-positive': 'error',

    // Import organization
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'import/no-mutable-exports': 'error',
  },
  // Specific overrides for specific file patterns
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'max-lines-per-function': 'off',
      },
    },
    {
      files: ['**/utils/**/*.js'],
      rules: {
        'max-lines-per-function': 'off',
      },
    },
  ],
};
