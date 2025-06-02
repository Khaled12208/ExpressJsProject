export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  verbose: true,
  // Coverage is now handled by NYC/Istanbul
  collectCoverage: false,
  // These settings are now in .nycrc.json
  // collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/types/**/*.ts'],
  // coverageDirectory: 'coverage',
};
