# Payload Crowdin Sync

Automatically upload/sync localized fields from the default locale to Crowdin. Make these fields read-only in other locales and update them using Crowdin translations.

- Plugin docs: [plugin/README.md](plugin/README.md)
- Payload test installation: [dev](dev)
- Payload test installation (alternative config): [dev-alternative-config](dev-alternative-config)
- NX generated docs: [docs/nx.md](docs/nx.md)

## Monorepo scripts

### Test

Run all tests.

The `plugin` package contains unit tests. Both the `dev` and `dev-alternative-config` packages contain integration tests run against Payload installations.

```
npm run test
```

### Release

Build the plugin, change to the plugin directory and run `npm publish`.

```
npm run release
```
