/**
 * Prettier Configuration
 *
 * This configuration is designed for the Vectorbit project to maintain
 * consistent code formatting across the codebase.
 */

module.exports = {
  // Basic formatting
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',

  // JSX formatting
  jsxSingleQuote: false,
  jsxBracketSameLine: false,

  // Special characters
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'avoid',

  // Markdown and prose formatting
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  endOfLine: 'lf',

  // File overrides
  overrides: [
    {
      files: '*.css',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
      },
    },
  ],
};
