import path from 'path'
import { fileURLToPath } from 'url'
import jestBaseConfig from '../../../jest.config.js'

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** @type {import('jest').Config} */
const customJestConfig = {
  ...jestBaseConfig,
  rootDir: '../',
  testMatch: ['<rootDir>/**/*.test.ts', '<rootDir>/tests/**/*int.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],

  globalSetup: path.resolve(dirname, './helpers/startMemoryDB.ts'),
  globalTeardown: path.resolve(dirname, './helpers/stopMemoryDB.ts'),

  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/helpers/mocks/emptyModule.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/helpers/mocks/fileMock.js',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '@/(.*)': '<rootDir>/src/$1',
    '@payload-types': '<rootDir>/src/payload-types.ts',
    'payload-crowdin-sync': '<rootDir>/../../plugin/src/index.ts',
  },
  prettierPath: require.resolve('prettier-2'),
}

export default customJestConfig
