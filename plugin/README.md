# Payload Crowdin Sync Plugin

Automatically upload/sync localized fields from the default locale to Crowdin. Make these fields read-only in other locales and update them using Crowdin translations.

- Development guidance: [docs/development.md](docs/development.md)
- Engineering decisions: [docs/enginering.md](docs/engineering.md)
- Crowdin collections: [docs/crowdin.md](docs/crowdin.md)
- NX generated docs: [docs/nx.md](docs/nx.md)

Note: This plugin is still in development. A todo list is maintained at [docs/development.md](docs/development.md).

## Requirements

- Payload version `1.0.19` or higher is required

## Usage

```
#npm
npm install payload-crowdin-sync

# yarn
yarn add payload-crowdin-sync
```

Add the plugin to your Payload configuration.

```ts
import { crowdinSync } from "payload-crowdin-sync";

export default buildConfig({
  plugins: [
    crowdinSync({
      projectId: 323731,
      token: process.env.CROWDIN_TOKEN,
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

### Options

#### Required

| Option | Example | Description |
| ------ | ------- | ----------- |
| `projectId` | `323731` | Your [Crowdin project ID](https://support.crowdin.com/enterprise/project-settings/#details). |
| `localeMap` | `{ de_DE: { crowdinId: "de" } }` | Map your Payload locales to Crowdin locale ids. |
| ` sourceLocale` | `en` | The Payload locale that syncs to source translations (files) on Crowdin. |

#### Optional

| Option | Example | Description |
| ------ | ------- | ----------- |
| `token` | `xxxxxxx` | Your [Crowdin API token](https://support.crowdin.com/enterprise/personal-access-tokens/). If empty, changes to files are disabled. |
| `directoryId` | `1169` | Crowdin directory ID to store translations. To get the directory ID without making an API call, inspect the page source of your folder in [Sources > Files](https://support.crowdin.com/file-management/#branches-and-folders). |
| `collections` | `undefined`<br />`[]`<br />`['posts', 'categories']`<br />`['posts', { slug: 'categories', condition: ({doc}) => doc.translateWithCrowdin]` | Define an array of collection slugs for which the plugin is active.<br /><br />If undefined, the plugin will detect localized fields on all collections.<br /><br />Use an empty array to disable all collections.<br /><br />Use an object to define a condition that activates Crowdin based on the document data. |
| `globals` | `undefined`<br />`[]`<br />`['nav']`<br />`[{ slug: 'nav', condition: ({doc}) => doc.translateWithCrowdin]` | Define an array of global slugs for which the plugin is active.<br /><br />If undefined, the plugin will detect localized fields on all globals.<br /><br />Use an empty array to disable all globals.<br /><br />Use an object to define a condition that activates Crowdin based on the document data. |
| `slateToHtmlConfig` | `undefined` | Pass a custom config for the `slateToHtml` serializer used to convert Payload CMS Slate JSON to HTML for Crowdin translation. See [Serializer configuration](docs/serializer.md). |
| `htmlToSlateConfig` | `undefined` | Pass a custom config for the `htmlToSlate` serializer used to conver HTML to Payload CMS Slate JSON when retrieving Crowdin translation. See [Serializer configuration](docs/serializer.md). |
| `pluginCollectionAccess` | `undefined` | `access` collection config to pass to all the Crowdin collections created by this plugin. |
| `pluginCollectionAdmin` | `undefined`<br />`{ hidden: ({ user }) => !userIsAdmin({ user }) }` | `admin` collection config to pass to all the Crowdin collections created by this plugin. |
| `tabbedUI` | `undefined`<br />`true` | Appends `Crowdin` tab onto your config using Payload's [Tabs Field](https://payloadcms.com/docs/fields/tabs). If your collection is not already tab-enabled, meaning the first field in your config is not of type `tabs`, then one will be created for you called `Content`. |

### Environment variables

Set `PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE=true` to update all localized fields in Crowdin when an article is created/updated.

By default, updates will only be sent to Crowdin in the following scenarios.

- At least one of the localized text fields has changed: any change to a localized `text` field updates the compiled `fields.json` that is sent to Crowdin.
- A `richText` field is changed. Individual `richText` fields will only be updated on Crowdin if the content has changed - each field has its own file on Crowdin.

It is useful to have a convenient way of forcing all localized fields to update at once. For example, if the plugin is activated on an existing install, it is convenient to trigger all updates on Crowdin for a given article without having to change every `richText` field or one of the `text` fields.

## Details

### Sync translations

Translation synchronisation refers to the process of loading translations from Crowdin into Payload CMS. If [drafts](https://payloadcms.com/docs/versions/drafts) are enabled, this will create a new version in Payload CMS for each locale. The source locale (e.g. `en`) is not affected.

**A UI has not been developed for this feature yet**. To perform updates now, use custom REST API endpoints that are made available by this plugin.

If supplied translations do not contain required fields, translation updates will not be applied and validation errors will be returned in the API response.

#### Sync global translations

To sync global translations, add a new article in **Crowdin Translations** that contains the global `slug`. Each article contains an `excludeLocales` field that can be used to prevent some locales from being included in the update operation.

##### Dry run

To review translations, visit:

`<payload-base-url>/api/crowdin-article-directories/<article-id>/review`

e.g. `https://my-payload-app.com/api/crowdin-article-directories/64a880bb87ef685285a4d9dc/update`

A JSON object is returned that allows you to review what will be updated in the database. The JSON object will contain the following keys:

- `draft` indicates that on update, a draft will be created rather than a published version. See [Drafts | Payload CMS](https://payloadcms.com/docs/versions/drafts).
- `source` review the source document. e.g. for the `en` locale.
- `translations`
  - `<locale>` e.g. `es_ES`
    - `currentTranslations` all current localized fields and values.
    - `currentTranslations` localized fields populated with values from Crowdin.
    - `changed` boolean to indicate whether any changes have been made in Crowdin.

#### Update

To update translations, visit:

`<payload-base-url>/api/crowdin-article-directories/<article-id>/review`

e.g. `https://my-payload-app.com/api/crowdin-article-directories/64a880bb87ef685285a4d9dc/update`

Pass the `draft=true` query parameter to update as a draft rather than a published version.

The document will be updated and the same report will be generated as for a review.
