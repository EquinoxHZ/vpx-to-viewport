module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'index.js',
    '!node_modules/**',
    '!coverage/**'
  ],
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
