/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  clearMocks: true,
  roots: ['<rootDir>/src', '<rootDir>/test'],
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { presets: ['@babel/preset-typescript'] }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.ts',
    '!src/database/**/*',
    '!src/queues/**/*',
    '!src/routes/**/*',
    '!src/utils/configs/**/*',
    '!src/utils/consts/**/*',
    '!src/utils/log.util.ts',
    '!src/utils/enums/**/*',
    '!src/utils/interfaces/**/*',
    '!src/utils/validators/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};

module.exports = config;
