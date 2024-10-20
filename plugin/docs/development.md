# Development

## Todo 21 Dec 2023

- [x] Support localized `text` and `textarea` fields. Combine text and textarea fields into a single json file on Crowdin called `fields.json`.
- [x] Support localized `richText` fields. Store each `richText` field as HTML (converted from Slate JSON) on Crowdin with a filename corresponding to the field name.
- [x] Store Crowdin files in an appropriate data structure.
- [x] Support **sending localized fields to Crowdin** for the following Payload fields (recursive - can go as deep as necessary):
  - [x] `group`
  - [x] `array`
  - [x] `collapsible`
  - [x] `blocks`
- [x] Improve testing so that it does not require a local server. See https://github.com/thompsonsj/payload-crowdin-sync/issues/40.
- [x] Support **updating localized fields from Crowdin** for the following Payload fields.
  - [x] `group`
  - [x] `array`
  - [x] `collapsible`
  - [x] `blocks`
- [ ] Add UI for syncing translations (currently done with URLs added to `server.ts` on the Payload installation).
- [ ] Required field detection to avoid update errors? See `getLocalizedRequiredFields`.
- [ ] Add option to make localized fields read-only in other locales (Crowdin manages these fields).

## Building

Run `nx build plugin` to build the library.

## Tests

Plugin test coverage is not 100%, but seeks to cover as many use cases as possible. This includes:

- Testing various field configurations for a collection.
- Using `nock` to intercept calls to the Crowdin API and ensure the right calls are being made.
- Unit tests to cover as many caes as possible for the supporting functions, which include a lot of recursion.

### Run

Run `npm run test` to execute unit and integration tests via [Jest](https://jestjs.io).

A Jest test suite is included comprising of:

- unit tests (`*.spec.ts`) within the `src` folder adjacent to files/functions that they are testing; and
- integration tests (`*.test.ts`) in the `dev/src/lib/tests` folder.
- integration tests (`*.test.ts`) in the `dev-alternative-config/src/lib/tests` folder.

Integration tests use Payload's [Local API](https://payloadcms.com/docs/local-api/overview) to run tests against a configured Payload installation in both the `dev` and `dev-alternative-config` folder. Tests use [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) to connect to for all tests, so it is not necessary to add test documents to a development database.

### Fixtures

Use `nx dev dev` or `nx dev dev-alternative-config` to run either of the local Payload installations. These local instances can be used to generate fixtures for use with integration tests.

### References

- Useful tips on using the local API in tests: https://github.com/payloadcms/payload/discussions/985.
- Review other Payload CMS plugins to see how test environments are configured there. e.g. https://github.com/payloadcms/plugin-cloud-storage and https://github.com/payloadcms/plugin-seo.
- Although the tutorial at https://payloadcms.com/blog/typescript-jest-vscode-debugger-tutorial works, I couldn't get it to work in the latest version of Payload CMS. Regardless, it makes more sense not to test the REST API as done in the tutorial, and to only work with the local API.
