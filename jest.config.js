/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  testMatch: ['**/?(*.)+(spec|test).ts'],

  roots: ['<rootDir>/src'],

  clearMocks: true,

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/data-source.ts'
  ]
};
