/* eslint-disable */
export default {
  displayName: 'plugin',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  moduleNameMapper: {
    '\\.(css|less|scss|svg|png)$': '<rootDir>/src/lib/api/mock/styleMock.js',
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/plugin',
};
