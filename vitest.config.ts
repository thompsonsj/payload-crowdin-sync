import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Mimic payloadcms/payload: one root vitest config using `projects`.
export default defineConfig({
  test: {
    watch: false,
    retry: process.env.CI ? 2 : 0,
    projects: [
      {
        test: {
          name: 'plugin',
          environment: 'node',
          globals: true,
          watch: false,
          retry: process.env.CI ? 2 : 0,
          include: ['plugin/src/**/*.{spec,test}.ts'],
          setupFiles: ['plugin/src/tests/vitest.setup.ts'],
        },
      },
      {
        resolve: {
          alias: {
            'payload-crowdin-sync': path.resolve('plugin/src/index.ts'),
          },
        },
        test: {
          name: 'dev',
          environment: 'node',
          globals: true,
          watch: false,
          retry: process.env.CI ? 2 : 0,
          include: ['dev/src/tests/**/*.test.ts'],
          fileParallelism: false,
          hookTimeout: 90000,
          testTimeout: 90000,
          setupFiles: ['dev/src/tests/vitest.setup.ts'],
          globalSetup: ['dev/src/tests/vitest.globalSetup.ts'],
        },
      },
      {
        resolve: {
          alias: {
            'payload-crowdin-sync': path.resolve('plugin/src/index.ts'),
          },
        },
        test: {
          name: 'dev-alternative-config',
          environment: 'node',
          globals: true,
          watch: false,
          retry: process.env.CI ? 2 : 0,
          include: ['dev-alternative-config/src/tests/**/*.test.ts'],
          fileParallelism: false,
          hookTimeout: 90000,
          testTimeout: 90000,
          setupFiles: ['dev-alternative-config/src/tests/vitest.setup.ts'],
          globalSetup: ['dev-alternative-config/src/tests/vitest.globalSetup.ts'],
        },
      },
    ],
  },
  resolve: {
    // Keep this explicit; many deps are ESM-first.
    conditions: ['node', 'import', 'default'],
    alias: {
      // Ensure plugin source is used by integration tests, mirroring the Jest mapper.
      'payload-crowdin-sync': path.resolve('plugin/src/index.ts'),
    },
  },
})

