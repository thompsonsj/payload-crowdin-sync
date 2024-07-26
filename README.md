# Payload Crowdin Sync

Automatically upload/sync localized fields from the default locale to Crowdin. Make these fields read-only in other locales and update them using Crowdin translations.

- Plugin docs: [plugin/README.md](plugin/README.md)
- Payload test installation: [dev](dev)
- Payload test installation (alternative config): [dev-alternative-config](dev-alternative-config)
- NX generated docs: [docs/nx.md](docs/nx.md)

## Quick start

```
npm install payload-crowdin-sync
```

Add the plugin to your Payload configuration.

```ts
import { crowdinSync } from "payload-crowdin-sync";

export default buildConfig({
  plugins: [
    crowdinSync({
      projectId: 323731,
      token: process.env.CROWDIN_TOKEN,
      organization: process.env.CROWDIN_ORGANIZATION,
      localeMap: {
        de_DE: {
          crowdinId: "de",
        },
        fr_FR: {
          crowdinId: "fr",
        },
      },
      sourceLocale: "en",
    }),
  ],
  // The rest of your config goes here
});
```

On save draft or publish, content from [localized fields](https://payloadcms.com/docs/configuration/localization) in [Collections](https://payloadcms.com/docs/configuration/collections) and/or [globals](https://payloadcms.com/docs/configuration/globals) is organised into directories and files within a `Payload CMS` directory (configurable) in your Crowdin project.

<img width="1000" alt="Screenshot 2024-02-06 at 22 02 38" src="https://github.com/thompsonsj/payload-crowdin-sync/assets/44806974/2c31050d-fee4-4275-bca2-7e4b48743999">

To load translations into Payload CMS, check the `Sync all translations` checkbox on a given collection document/global and save draft (loads translations as draft) or publish.

<img width="766" alt="Screenshot 2024-02-06 at 22 08 48" src="https://github.com/thompsonsj/payload-crowdin-sync/assets/44806974/2aa9c493-7792-422f-bf8d-a91c23893682">

## Monorepo scripts

### Test

Run all tests.

- The `plugin` package contains unit tests.
- Both the `dev` and `dev-alternative-config` packages contain integration tests run against Payload installations.

```
npm run test
```

### Release

Build the plugin, change to the plugin directory and run `npm publish`.

```
npm run release
```
