# Changelog

## [0.23.0](https://github.com/thompsonsj/payload-crowdin-sync/compare/dev-v0.22.1...dev-v0.23.0) (2023-12-20)


### Features

* **lexical:** support lexical rich text ([#140](https://github.com/thompsonsj/payload-crowdin-sync/issues/140)) ([4921e4d](https://github.com/thompsonsj/payload-crowdin-sync/commit/4921e4dbc6221f27dae9fa282de09506b3124863))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * payload-crowdin-sync bumped from 0.22.1 to 0.23.0

## [0.22.1](https://github.com/thompsonsj/payload-crowdin-sync/compare/dev-v0.22.0...dev-v0.22.1) (2023-12-19)


### Bug Fixes

* **pluginfields:** ensure syncAllTranslations is virtual ([#138](https://github.com/thompsonsj/payload-crowdin-sync/issues/138)) ([13c3f3e](https://github.com/thompsonsj/payload-crowdin-sync/commit/13c3f3e1f68331aeff53c1045b90ec86886baa85))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * payload-crowdin-sync bumped from 0.22.0 to 0.22.1

## [0.22.0](https://github.com/thompsonsj/payload-crowdin-sync/compare/dev-v0.21.0...dev-v0.22.0) (2023-12-15)


### Features

* **afterdelete:** add hook to delete collection article files ([#95](https://github.com/thompsonsj/payload-crowdin-sync/issues/95)) ([0a58adb](https://github.com/thompsonsj/payload-crowdin-sync/commit/0a58adb399f2dda602068bb202fae3cc4a4fc598))
* **afterDelete:** delete Crowdin article directory on delete ([#98](https://github.com/thompsonsj/payload-crowdin-sync/issues/98)) ([bdadec5](https://github.com/thompsonsj/payload-crowdin-sync/commit/bdadec5653242d34b80c5986426452b90a62e0ff))
* delete CrowdIn files if empty, ensure `fields.json` is non-empty ([#46](https://github.com/thompsonsj/payload-crowdin-sync/issues/46)) ([b681bef](https://github.com/thompsonsj/payload-crowdin-sync/commit/b681bef3334ee7f58d1c05c6f2f486c652e49495))
* **endpoints:** add custom endpoints for global translation sync ([#69](https://github.com/thompsonsj/payload-crowdin-sync/issues/69)) ([08b2163](https://github.com/thompsonsj/payload-crowdin-sync/commit/08b2163e8a552263d3ac016266f7cd70e22e51fb))
* **files:** store fileData sent to CrowdIn ([#61](https://github.com/thompsonsj/payload-crowdin-sync/issues/61)) ([7f28a47](https://github.com/thompsonsj/payload-crowdin-sync/commit/7f28a47f530eba7119b5015b5de9f1426e547133))
* migrate to nx monorepo ([#125](https://github.com/thompsonsj/payload-crowdin-sync/issues/125)) ([3fbd3c5](https://github.com/thompsonsj/payload-crowdin-sync/commit/3fbd3c551ec0a73fd3deb18f860da6f02dafe5db))
* **package.json:** use @slate-serializers/html and add config options ([#112](https://github.com/thompsonsj/payload-crowdin-sync/issues/112)) ([c1506a3](https://github.com/thompsonsj/payload-crowdin-sync/commit/c1506a3b02b261845d6ccf415e2f197b1b0a5503))
* **plugin:** collections/globals option ([#107](https://github.com/thompsonsj/payload-crowdin-sync/issues/107)) ([a738dc5](https://github.com/thompsonsj/payload-crowdin-sync/commit/a738dc5d835804354104f7025544492e85873a09))
* **pluginfields:** sync from Crowdin virtual fields ([#127](https://github.com/thompsonsj/payload-crowdin-sync/issues/127)) ([87c3c15](https://github.com/thompsonsj/payload-crowdin-sync/commit/87c3c15b70d06641756c096520828e171417f27c))
* **plugin:** return original config if no token ([#100](https://github.com/thompsonsj/payload-crowdin-sync/issues/100)) ([2d5f516](https://github.com/thompsonsj/payload-crowdin-sync/commit/2d5f5164e64b331e0f5ce6c10e3ee0760938fb3a))
* support blocks field type ([#47](https://github.com/thompsonsj/payload-crowdin-sync/issues/47)) ([6a8d4a9](https://github.com/thompsonsj/payload-crowdin-sync/commit/6a8d4a9aea9799c537f0e1452132b827a714e87b))
* **translations:** move endpoints, send id and blockType to CrowdIn for arrays and blocks ([#80](https://github.com/thompsonsj/payload-crowdin-sync/issues/80)) ([2c0fcbd](https://github.com/thompsonsj/payload-crowdin-sync/commit/2c0fcbdfb19a7890ddf06a11f2564d7abb4bf762))
* **translations:** support the draft parameter ([#119](https://github.com/thompsonsj/payload-crowdin-sync/issues/119)) ([dda5e7c](https://github.com/thompsonsj/payload-crowdin-sync/commit/dda5e7cbd7b394b30dcc75726821e56c95469e8d))
* **translations:** update fn works with json and html ([#82](https://github.com/thompsonsj/payload-crowdin-sync/issues/82)) ([78c2adc](https://github.com/thompsonsj/payload-crowdin-sync/commit/78c2adcb56d180fd1cafd71eb586bb39eb6e65a9))
* upgrade to payload v2 ([#109](https://github.com/thompsonsj/payload-crowdin-sync/issues/109)) ([8796376](https://github.com/thompsonsj/payload-crowdin-sync/commit/87963765994691363a368ea3f7254ac4ce1fc63a))


### Bug Fixes

* **files:** correct parameter for file update/delete ([#57](https://github.com/thompsonsj/payload-crowdin-sync/issues/57)) ([78eed77](https://github.com/thompsonsj/payload-crowdin-sync/commit/78eed77ec7a3fbd0d13a6abbfca1059f5843abfe))
* **gethtmlfieldslugs:** incomplete html field translations ([#105](https://github.com/thompsonsj/payload-crowdin-sync/issues/105)) ([cfbfcd8](https://github.com/thompsonsj/payload-crowdin-sync/commit/cfbfcd889429c4a4c8ee54599fb83a8e41e2d980))
* **tests:** following [#85](https://github.com/thompsonsj/payload-crowdin-sync/issues/85) ([#87](https://github.com/thompsonsj/payload-crowdin-sync/issues/87)) ([dcdb42c](https://github.com/thompsonsj/payload-crowdin-sync/commit/dcdb42cd6ef8bab5525976b5720a978674db45df))
* **translations:** docs with only richText translations do not update ([#44](https://github.com/thompsonsj/payload-crowdin-sync/issues/44)) ([94b489f](https://github.com/thompsonsj/payload-crowdin-sync/commit/94b489f8564dd514dbe6ae610449ad968ae0168a))
* **translations:** ensure non-localized blocks/array items are not lost ([#116](https://github.com/thompsonsj/payload-crowdin-sync/issues/116)) ([9c590ad](https://github.com/thompsonsj/payload-crowdin-sync/commit/9c590adf78f040286891320557ed1dd661c261d0))
* **translations:** update translations with new CrowdIn JSON structure ([#81](https://github.com/thompsonsj/payload-crowdin-sync/issues/81)) ([6ef4331](https://github.com/thompsonsj/payload-crowdin-sync/commit/6ef43316881f52e466eee4dd40ffbd3b6ae343e0))
* typo renaming ([#84](https://github.com/thompsonsj/payload-crowdin-sync/issues/84)) ([3cf30ce](https://github.com/thompsonsj/payload-crowdin-sync/commit/3cf30ce6a2e11b23ada99170c88196ef10f737f1))
* **utilities:** exclude id properties from arrays ([#64](https://github.com/thompsonsj/payload-crowdin-sync/issues/64)) ([48390bb](https://github.com/thompsonsj/payload-crowdin-sync/commit/48390bbd8ae6156d4637906426df781f148825d6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * payload-crowdin-sync bumped from * to 0.22.0
