module.exports = {
    testEnvironment: 'node',
    testMatch: [
      '**/__tests__/**/*.test.js',
      '**/?(*.)+(spec|test).js'
    ],
    collectCoverageFrom: [
      'controllers/**/*.js',
      'services/**/*.js',
      'routes/**/*.js',
      '!**/node_modules/**',
      '!**/coverage/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testTimeout: 10000,
    verbose: true,
  
    // ❌ Removed: testPathPatterns (invalid)
    // ✅ Use the correct CLI flag instead when running tests
  
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
  
    testEnvironmentOptions: {
      NODE_ENV: 'test'
    },
  
    clearMocks: true,
    restoreMocks: true,
    collectCoverage: false,
    testPathIgnorePatterns: [
      '/node_modules/',
      '/coverage/'
    ],
    moduleFileExtensions: ['js', 'json'],
    transform: {},
    globalSetup: undefined,
    globalTeardown: undefined,
  };
  