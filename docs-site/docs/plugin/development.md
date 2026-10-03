---
sidebar_position: 5
description: Build, lint and test the plugin in the Nx monorepo.
---

# Development

- [Monorepo](#monorepo)
- [Build](#build)
- [Lint](#lint)
- [Test](#test)
- [Import maps](#import-maps)
- [Run a Payload install locally](#run-a-payload-install-locally)

## Monorepo

The repository is an [Nx](https://nx.dev) monorepo with these projects:

- `plugin`: the `payload-crowdin-sync` package.
- `dev`: a Payload install that uses the plugin, for integration tests. Tests that need a different plugin config pass `pluginOptionsOverride` to `initPayloadInt`.
- `docs-site`: this documentation site.

## Build

In the root of the repository:

- `nx build plugin` builds to `dist/plugin`.
- `nx build plugin --watch` rebuilds when files change.

## Lint

- `nx lint plugin`
- `nx lint dev`

## Test

Tests use [Vitest](https://vitest.dev). In the root of the repository:

- `npm run test` runs all tests.
- `npm run test:coverage` runs all tests with coverage. Reports are written to `coverage/<project>`.
- `nx test plugin` runs unit tests only.
- `nx test dev` runs integration tests against the Payload install.

Unit tests (`*.spec.ts`) sit next to the code they test in `plugin/src`. Many of them cover the recursive functions that find and rebuild localized fields.

Integration tests (`*.test.ts`) are in `dev/src/tests`. They use Payload's [Local API](https://payloadcms.com/docs/local-api/overview) against a real Payload install with an in-memory MongoDB database. Calls to the Crowdin API are intercepted with [`nock`](https://github.com/nock/nock), so tests check which requests the plugin makes without needing a Crowdin account.

To start Payload with a different plugin config, pass `pluginOptionsOverride` to `initPayloadInt`. The override is shallow-merged over the default test options, so `{ collections: undefined }` replaces the default collections list. Pass the same override to `pluginConfig` when setting up Crowdin mocks.

CI runs `npm run test:coverage` and uploads the results to [Codecov](https://about.codecov.io). This needs the `CODECOV_TOKEN` repository secret.

## Import maps

Payload finds custom admin components through an import map. After changing admin components in `dev/`, regenerate it:

```bash
npm run generate:importmaps
```

CI fails if the committed import map is missing or out of date.

Running the integration tests can overwrite `dev/src/app/(payload)/admin/importMap.js` with an empty map. Restore it with `git restore` before committing.

## Run a Payload install locally

```bash
cd dev
npm run dev
```

A local install is useful for trying out changes in the admin panel, and for generating fixtures for integration tests.
