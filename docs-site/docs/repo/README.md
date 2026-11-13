---
sidebar_position: 1
description: How the payload-crowdin-sync repository is organised, and how tests, coverage and releases work.
---

# Repository

Notes for contributors and maintainers. To use the plugin, start with [getting started](../plugin/README.md).

## Layout

- [`plugin/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/plugin): the `payload-crowdin-sync` package published to npm.
- [`document/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/document): workspace library `payload-localized-fields` — walk localized Payload fields for import, export, or translation plugins. Vendored into the plugin tarball; not published to npm.
- [`adapters/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/adapters): workspace library `payload-localization-adapters` — writer/reader contracts for a json/html document slice. Phrase and Lokalise plugins will live alongside this. Vendored into the plugin tarball; not published to npm.
- [`dev/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/dev): Payload install used for integration tests.
- [`docs-site/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/docs-site): this documentation site, built with Docusaurus and published to GitHub Pages.
- [`tools/`](https://github.com/thompsonsj/payload-crowdin-sync/tree/main/tools): scripts that vendor workspace libraries into the plugin tarball and rewrite published entrypoints.

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

Releases are managed by [release-please](https://github.com/googleapis/release-please). Packages in `release-please-config.json` (`.` / `source`, `plugin` / `payload-crowdin-sync`, `document`, `adapters`, `dev`) share one `chore: release main` PR. Changelog files live next to each package — `changelog-path` is relative to the package directory, not the repo root. Only `payload-crowdin-sync` is published to npm. Do not add text above the `:robot:` marker in a release PR body; that prevents GitHub releases from being created and blocks later release PRs.

When a release PR is merged to `main`, the [`release-please` workflow](https://github.com/thompsonsj/payload-crowdin-sync/blob/main/.github/workflows/release-please.yml) tags each configured package, then runs `nx run plugin:package` and publishes `payload-crowdin-sync` via [trusted publishing (OIDC)](https://docs.npmjs.com/trusted-publishers/). That package step vendors compiled `document/` and `adapters/` into the tarball, so consumers do not install those libraries from npm. Publish skips a version that is already on npm, so a half-finished release can be retried with **Actions → release-please → Run workflow** from `main` and **publish_missing**. Dispatches from other branches do not publish.

Changes under `document/` or `adapters/` should use a `plugin` commit scope (for example `fix(plugin): …`) so the next plugin release includes them. On [npmjs.com](https://www.npmjs.com/package/payload-crowdin-sync), **Settings** > **Trusted publishing** should list repository `thompsonsj/payload-crowdin-sync` and workflow filename `release-please.yml`. After automated publishes work, revoke the `NPM_TOKEN` repository secret.

Manual publish remains available as a fallback:

```bash
npm run release
```

## Other notes

- [Packages](./packages.md) — field walk, writer/reader contracts, Crowdin plugin
- [Engineering decisions](./engineering.md)
- [Planned features](./planned-features.md)
- [Refactoring notes](./refactoring.md) and [broad refactoring plan](./refactoring-broad.md)
