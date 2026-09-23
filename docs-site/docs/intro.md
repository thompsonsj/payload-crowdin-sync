---
sidebar_position: 1
sidebar_label: Introduction
description: How payload-crowdin-sync moves content between Payload CMS and Crowdin, and where to start.
---

# Introduction

`payload-crowdin-sync` keeps your content in [Payload CMS](https://payloadcms.com) while your translators work in [Crowdin](https://crowdin.com).

## How it works

1. **You save a document.** When you save a draft or publish, the plugin finds the document's localized fields in the source locale.
2. **Content is uploaded to Crowdin.** Each rich text field becomes an HTML file. All other localized text fields are compiled into one `fields.json`. The files go into a folder for the document, inside a folder for its collection. Only fields that changed are uploaded again.
3. **Translators work in Crowdin.** They see clean HTML and JSON strings, not editor state or unrelated fields.
4. **You load translations.** Tick **Sync translations** (current locale) or **Sync all translations** on the document and save. The plugin downloads each file for each locale, converts it back into Payload's format, and updates the document as a draft or published version. You can also use [REST endpoints](./plugin/README.md#endpoints) or [Payload jobs](./plugin/README.md#environment-variables).

## Where to start

- [Install and configure the plugin](./plugin/README.md)
- [Check which fields are supported](./plugin/fields.md)
- [See how documents map to Crowdin](./plugin/crowdin.md)
- [Customise the Slate serializer](./plugin/serializer.md)
