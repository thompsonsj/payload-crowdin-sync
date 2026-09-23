---
sidebar_position: 1
description: How the payload-crowdin-sync repository is organised, and how tests, coverage and releases work.
---

# Repository

Notes for contributors and maintainers. To use the plugin, start with [getting started](../plugin/README.md).

## Layout

- [`plugin/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/plugin): the `payload-crowdin-sync` package published to npm.
- [`dev/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/dev) and [`dev-alternative-config/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/dev-alternative-config): Payload installs used for integration tests.
- [`docs-site/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/docs-site): this documentation site, built with Docusaurus and published to GitHub Pages.

The repository is an Nx monorepo. See [Nx](./nx.md) for general Nx commands.

## Scripts

```bash
npm install
npm run test                 # unit and integration tests
npm run test:coverage        # the same, with coverage reports in coverage/<project>
npm run generate:importmaps  # regenerate Payload import maps in dev/ and dev-alternative-config/
npm run docs:serve           # run this site locally
```

See [development](../plugin/development.md) for how the tests are organised, and why import maps matter.

## Continuous integration

On every pull request and push to `main`, CI:

- checks that both Payload import maps are committed and up to date
- runs all tests with coverage
- uploads coverage to [Codecov](https://about.codecov.io) and keeps the reports as a build artifact for 14 days

See [PR labels](./pr-labels.md) for how pull requests are labelled.

## Release

Releases are managed by [release-please](https://github.com/googleapis/release-please). When a release PR is merged to `main`, the [`release-please` workflow](https://github.com/thompsonsj/payload-crowdin-sync/blob/main/.github/workflows/release-please.yml) builds and publishes `payload-crowdin-sync` to npm via [trusted publishing (OIDC)](https://docs.npmjs.com/trusted-publishers/).

One-time npm setup (package maintainer): on [npmjs.com](https://www.npmjs.com/package/payload-crowdin-sync), go to **Settings** > **Trusted publishing** and add a GitHub Actions publisher for repository `thompsonsj/payload-crowdin-sync` and workflow filename `release-please.yml`. After verifying automated publishes work, revoke the `NPM_TOKEN` repository secret.

Manual publish remains available as a fallback:

```bash
npm run release
```

## Other notes

- [Engineering decisions](./engineering.md)
- [Planned features](./planned-features.md)
- [Refactoring notes](./refactoring.md) and [broad refactoring plan](./refactoring-broad.md)
