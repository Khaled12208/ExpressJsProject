export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/types/**/*.ts'],
  coverageDirectory: 'coverage',
};
