module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.(ts|js)'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};