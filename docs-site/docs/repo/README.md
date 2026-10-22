---
sidebar_position: 1
description: How the payload-crowdin-sync repository is organised, and how tests, coverage and releases work.
---

# Repository

Notes for contributors and maintainers. To use the plugin, start with [getting started](../plugin/README.md).

## Layout

- [`plugin/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/plugin): the `payload-crowdin-sync` package published to npm.
- [`document/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/document): the `payload-localized-fields` package — walk localized Payload fields for import, export, or translation plugins.
- [`adapters/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/adapters): the `payload-localization-adapters` package — writer/reader contracts for a json/html document slice. Phrase and Lokalise plugins will live alongside this.
- [`dev/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/dev): Payload install used for integration tests.
- [`docs-site/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/docs-site): this documentation site, built with Docusaurus and published to GitHub Pages.

The repository is an Nx monorepo. See [Nx](./nx.md) for general Nx commands.

## Scripts

```bash
npm install
npm run test                 # unit and integration tests
npm run test:coverage        # the same, with coverage reports in coverage/<project>
npm run generate:importmaps  # regenerate the Payload import map in dev/
npm run docs:serve           # run this site locally
```

See [development](../plugin/development.md) for how the tests are organised, and why import maps matter.

## Continuous integration

On every pull request and push to `main`, CI:

- checks that the Payload import map is committed and up to date
- runs all tests with coverage
- uploads coverage to [Codecov](https://about.codecov.io) and keeps the reports as a build artifact for 14 days

See [PR labels](./pr-labels.md) for how pull requests are labelled.

## Release

Releases are managed by [release-please](https://github.com/googleapis/release-please). Packages in `release-please-config.json` (`.` / `source`, `plugin` / `payload-crowdin-sync`, `document` / `payload-localized-fields`, `adapters` / `payload-localization-adapters`, `dev`) share one `chore: release main` PR. Changelog files live next to each package (`plugin/CHANGELOG.md`, `document/CHANGELOG.md`, `adapters/CHANGELOG.md`, `dev/CHANGELOG.md`) — `changelog-path` is relative to the package directory, not the repo root. Do not add text above the `:robot:` marker in a release PR body; that prevents GitHub releases from being created and blocks later release PRs.

When a release PR is merged to `main`, the [`release-please` workflow](https://github.com/thompsonsj/payload-crowdin-sync/blob/main/.github/workflows/release-please.yml) tags `payload-crowdin-sync-vX`, `payload-localized-fields-vX`, `payload-localization-adapters-vX`, `source-vX`, and `dev-vX`, then builds and publishes the public packages to npm via [trusted publishing (OIDC)](https://docs.npmjs.com/trusted-publishers/).

First publish of a new package must be manual (`cd dist/<package> && npm publish --access public`); trusted publishing cannot create the package. After `nx build <package>`, run `node tools/scripts/rewrite-dist-entrypoints.mjs dist/<package>` so the tarball points at compiled `.js` rather than the workspace `./src/index.ts` entry. Then, on [npmjs.com](https://www.npmjs.com/package/payload-crowdin-sync), [payload-localized-fields](https://www.npmjs.com/package/payload-localized-fields), and [payload-localization-adapters](https://www.npmjs.com/package/payload-localization-adapters), go to **Settings** > **Trusted publishing** and add a GitHub Actions publisher for repository `thompsonsj/payload-crowdin-sync` and workflow filename `release-please.yml`. After verifying automated publishes work, revoke the `NPM_TOKEN` repository secret. Plugin publish fails until `payload-localization-adapters` at the version in `plugin/package.json` exists on npm (or is published earlier in the same job). Do not ship the plugin while that dependency is still `0.0.0`.

Manual publish remains available as a fallback:

```bash
npm run release
```

## Other notes

- [Packages](./packages.md) — field walk, writer/reader contracts, Crowdin plugin
- [Engineering decisions](./engineering.md)
- [Planned features](./planned-features.md)
- [Refactoring notes](./refactoring.md) and [broad refactoring plan](./refactoring-broad.md)
