---
sidebar_position: 1
sidebar_label: Introduction
description: Nested Payload documents reorganised into compact HTML and JSON for Crowdin translators.
---

# Introduction

`payload-crowdin-sync` takes nested [Payload CMS](https://payloadcms.com) documents and rebuilds them as compact HTML and JSON files in [Crowdin](https://crowdin.com). Translators work in Crowdin's editor. You keep editing in Payload.

A document can be arbitrarily deep. Groups, arrays, tabs, rows, and Lexical blocks nested inside rich text are all included. File count is kept down: one `fields.json` for text, one HTML file per rich text field, and a small folder per Lexical block. Fields that are not translatable stay in Payload.

## How it works

1. **You save a document.** When you save a draft or publish, the plugin finds the document's localized fields in the source locale.
2. **Content is uploaded to Crowdin.** Each rich text field becomes an HTML file. All other localized text fields are compiled into one `fields.json`. The files go into a folder for the document, inside a folder for its collection. Only fields that changed are uploaded again.
3. **Translators work in Crowdin.** They see HTML and JSON strings, not editor state or unrelated fields.
4. **You load translations.** Tick **Sync translations** (current locale) or **Sync all translations** on the document and save. The plugin downloads each file for each locale, converts it back into Payload's format, and updates the document as a draft or published version. You can also use [REST endpoints](./plugin/README.md#endpoints) or [Payload jobs](./plugin/README.md#environment-variables).

The walk that builds those files is not Crowdin-specific. [Packages](./repo/packages.md) shows the workspace libraries (`payload-localized-fields`, `payload-localization-adapters`) and this plugin, which is the only package on npm. [Engineering decisions](./repo/engineering.md#why-a-document-slice-not-field-hooks) covers why we batch a document (fewer API calls, rich text and blocks, Crowdin folders) rather than upload from each field hook.

## Where to start

- [Install and configure the plugin](./plugin/README.md)
- [Check which fields are supported](./plugin/fields.md)
- [See how documents map to Crowdin](./plugin/crowdin.md)
- [Customise the Slate serializer](./plugin/serializer.md)
