module.exports = {
  moduleFileExtensions: [
    'js',
    'json',
    'ts',
  ],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/src/',
    '<rootDir>/test/',
  ],
  moduleNameMapper: {
    '@aibeautylens/shared/(.*)': '<rootDir>/../shared/src/$1',
    '^@backend/(.*)$': '<rootDir>/src/$1',
    // No explicit mock for @nestjs/axios here, let NestJS testing handle it via providers
  },
}; 