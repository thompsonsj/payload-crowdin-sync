/* eslint-disable */
export default {
  displayName: 'dev',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  moduleNameMapper: {
    '\\.(css|less|scss|svg|png)$': '<rootDir>/src/lib/tests/styleMock.ts',
  },
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  testTimeout: 90000,
  openHandlesTimeout: 5000,
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/dev',
  "transformIgnorePatterns": [
    "node_modules/(?!(@swc\/types))"
  ],
  prettierPath: require.resolve('prettier-2'),
};
