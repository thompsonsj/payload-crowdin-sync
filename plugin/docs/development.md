# Development

- [Monorepo](#monorepo)
- [Build](#build)
- [Format](#format)
- [Lint](#lint)
- [Test](#test)

## Monorepo

The `payload-crowdin-sync` plugin is developed in the `plugin` folder.

Both the `dev` and `dev-alternative-config` folders contain configured local Payload CMS installations that use this plugin.

## Build

In the root of the repository:

- `nx build plugin` - build to `dist/plugin`.
- `nx build plugin --watch` to build when files change.

## Format

- `nx prettier plugin`
- `nx prettier dev`
- `nx prettier dev-alternative-config`

## Lint

- `nx lint plugin`
- `nx lint dev`
- `nx lint dev-alternative-config`

## Test

In the root of the repository:

- `npm run test` to execute unit and integration tests via [Jest](https://jestjs.io).
- `nx test plugin` to run plugin tests only.
- `nx test dev` to run integration tests against the `dev` Payload install.
- `nx test dev-alternative-config` to run integration tests against the `dev-alternative-config` Payload install.

Plugin test coverage is not 100%, but seeks to cover as many use cases as possible. This includes:

- Testing various field configurations for a collection.
- Using `nock` to intercept calls to the Crowdin API and ensure the right calls are being made.
- Unit tests to cover as many caes as possible for the supporting functions, which include a lot of recursion.

### Jest

A Jest test suite is included comprising of:

- unit tests (`*.spec.ts`) within the `src` folder adjacent to files/functions that they are testing; and
- integration tests (`*.test.ts`) in the `dev/src/lib/tests` folder.
- integration tests (`*.test.ts`) in the `dev-alternative-config/src/lib/tests` folder.

### Integration

Integration tests use Payload's [Local API](https://payloadcms.com/docs/local-api/overview) to run tests against a configured Payload installation in both the `dev` and `dev-alternative-config` folder. Test configuration is based on the way tests are configured in https://github.com/payloadcms/payload/tree/main/test.

### Fixtures

Use `nx dev dev` or `nx dev dev-alternative-config` to run either of the local Payload installations. These local instances can be used to generate fixtures for use with integration tests.
