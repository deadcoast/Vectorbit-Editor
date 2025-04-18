// npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event babel-jest

module.exports = {
  // Test environment setup for simulating the DOM
  testEnvironment: 'jsdom',

  // File transformations for handling specific file types
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest', // JavaScript/JSX transformations
    '^.+\\.svg$': '<rootDir>/jest-svg-transform.js', // Transform SVG files
  },

  // Module aliasing and non-JS import handling
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
    '^@/(.*)$': '<rootDir>/src/$1', // Alias for cleaner imports
  },

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)', // Match files in `__tests__` folders
    '**/?(*.)+(spec|test).[tj]s?(x)', // Match files ending in `.spec` or `.test`
  ],

  // Environment variable and setup configurations
  setupFiles: ['dotenv/config'], // Automatically load `.env` variables
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'], // Extend setup for testing utilities

  // Coverage collection configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}', // Include all source files for coverage
    '!src/**/*.d.ts', // Exclude TypeScript declaration files (redundant here but for safety)
    '!src/index.js', // Exclude entry points
    '!src/server/**', // Exclude server-side files
  ],
  coverageThreshold: {
    global: {
      branches: 85, // Minimum branch coverage
      functions: 90, // Minimum function coverage
      lines: 90, // Minimum line coverage
      statements: 90, // Minimum statement coverage
    },
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],

  // Watch plugins for improved test discovery
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],

  // Resolver for advanced file handling
  resolver: '<rootDir>/jest-resolver.js',

  // Snapshot serializers for better testing of React components
  snapshotSerializers: ['enzyme-to-json/serializer'],

  // Verbose test output and error handling
  verbose: true, // Detailed output for test runs
  bail: false, // Continue running all tests even after failures
  maxWorkers: '70%', // Optimize performance for CI/CD pipelines

  // Global configurations
  globals: {
    __DEV__: true, // Enable development-specific configurations
  },

  // Additional configurations for enhanced testing
  timers: 'modern', // Use modern timers for consistent results
  moduleDirectories: ['node_modules', 'src'], // Simplify module resolution
  resetMocks: true, // Reset mocks between test files
  restoreMocks: true, // Restore mocks automatically after each test

  // Cache settings for faster repeated test runs
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  detectLeaks: true, // Detect memory leaks during test execution
  detectOpenHandles: true, // Identify open handles after tests
};
