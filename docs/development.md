# WIP 8 July 2023

This plugin is currently being refactored. Although the logic works, it was extracted from a Payload CMS install and needs work to decouple logic from that installation.

Features:

- [x] Support localized `text` and `textarea` fields. Combine text and textarea fields into a single json file on Crowdin called `fields.json`.
- [x] Support localized `richText` fields. Store each `richText` field as HTML (converted from Slate JSON) on Crowdin with a filename corresponding to the field name.
- [x] Store Crowdin files in an appropriate data structure.
- [x] Support **sending localized fields to Crowdin** for the following Payload fields (recursive - can go as deep as necessary):
  - [x] `group`
  - [x] `array`
  - [x] `collapsible`
  - [x] `blocks`
- [x] Improve testing so that it does not require a local server. See https://github.com/thompsonsj/payload-crowdin-sync/issues/40.
- [ ] Support **updating localized fields from Crowdin** for the following Payload fields. Note that this will require effective required field detection to avoid update errors. See `getLocalizedRequiredFields`.
  - [x] `group`
  - [x] `array`
  - [x] `collapsible`
  - [x] `blocks`
- [ ] Add UI for syncing translations (currently done with URLs added to `server.ts` on the Payload installation).
- [ ] Add option to make localized fields read-only in other locales (Crowdin manages these fields).
