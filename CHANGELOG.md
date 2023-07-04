# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.9.1](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.9.0...v0.9.1) (2023-07-04)


### Bug Fixes

* **utilities:** exclude id properties from arrays ([#64](https://github.com/thompsonsj/payload-crowdin-sync/issues/64)) ([48390bb](https://github.com/thompsonsj/payload-crowdin-sync/commit/48390bbd8ae6156d4637906426df781f148825d6))

## [0.9.0](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.8.2...v0.9.0) (2023-07-04)


### Features

* **files:** store fileData sent to CrowdIn ([#61](https://github.com/thompsonsj/payload-crowdin-sync/issues/61)) ([7f28a47](https://github.com/thompsonsj/payload-crowdin-sync/commit/7f28a47f530eba7119b5015b5de9f1426e547133))

## [0.8.2](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.8.1...v0.8.2) (2023-07-03)


### Bug Fixes

* **files:** correct parameter for file update/delete ([#57](https://github.com/thompsonsj/payload-crowdin-sync/issues/57)) ([78eed77](https://github.com/thompsonsj/payload-crowdin-sync/commit/78eed77ec7a3fbd0d13a6abbfca1059f5843abfe))

## [0.8.1](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.8.0...v0.8.1) (2023-07-03)


### Bug Fixes

* **files:** fixes following [#52](https://github.com/thompsonsj/payload-crowdin-sync/issues/52) ([#54](https://github.com/thompsonsj/payload-crowdin-sync/issues/54)) ([cf38d2d](https://github.com/thompsonsj/payload-crowdin-sync/commit/cf38d2d241fc2392e0bd13bdeaf335f2a3c558a1))
* **files:** update file logic ([#52](https://github.com/thompsonsj/payload-crowdin-sync/issues/52)) ([e4a863e](https://github.com/thompsonsj/payload-crowdin-sync/commit/e4a863ef180e3d2bf1fec445db5c78855982ad94))

## [0.8.0](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.7.0...v0.8.0) (2023-07-02)


### Features

* support tabs field type ([#49](https://github.com/thompsonsj/payload-crowdin-sync/issues/49)) ([a309dd7](https://github.com/thompsonsj/payload-crowdin-sync/commit/a309dd71ab4a14f31b1e4ef9663693ea2e54e6ec))

## [0.7.0](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.6.0...v0.7.0) (2023-07-02)


### Features

* delete CrowdIn files if empty, ensure `fields.json` is non-empty ([#46](https://github.com/thompsonsj/payload-crowdin-sync/issues/46)) ([b681bef](https://github.com/thompsonsj/payload-crowdin-sync/commit/b681bef3334ee7f58d1c05c6f2f486c652e49495))
* support blocks field type ([#47](https://github.com/thompsonsj/payload-crowdin-sync/issues/47)) ([6a8d4a9](https://github.com/thompsonsj/payload-crowdin-sync/commit/6a8d4a9aea9799c537f0e1452132b827a714e87b))


### Bug Fixes

* **translations:** docs with only richText translations do not update ([#44](https://github.com/thompsonsj/payload-crowdin-sync/issues/44)) ([94b489f](https://github.com/thompsonsj/payload-crowdin-sync/commit/94b489f8564dd514dbe6ae610449ad968ae0168a))

## [0.6.0](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.5.2...v0.6.0) (2023-06-19)


### Features

* **utilities:** offer ability to exclude localized fields ([#35](https://github.com/thompsonsj/payload-crowdin-sync/issues/35)) ([7d4e4e4](https://github.com/thompsonsj/payload-crowdin-sync/commit/7d4e4e46a9cd5d02f82a19833e523f47f696aefc))

## [0.5.2](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.5.1...v0.5.2) (2023-06-08)


### Bug Fixes

* **api:** invalid name error when more than 10 files ([#32](https://github.com/thompsonsj/payload-crowdin-sync/issues/32)) ([113f457](https://github.com/thompsonsj/payload-crowdin-sync/commit/113f4571fe6911d5745fc8d88f7816620c118fc2))

## [0.5.1](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.5.0...v0.5.1) (2023-06-08)


### Bug Fixes

* **plugin-seo:** return empty if localized fields are only seo ([#30](https://github.com/thompsonsj/payload-crowdin-sync/issues/30)) ([02145ac](https://github.com/thompsonsj/payload-crowdin-sync/commit/02145acae69dd24983412cb999ef7c00a0313660))

## [0.5.0](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.4.1...v0.5.0) (2023-06-08)


### Features

* **utilities:** textarea field support ([#27](https://github.com/thompsonsj/payload-crowdin-sync/issues/27)) ([1e4c08d](https://github.com/thompsonsj/payload-crowdin-sync/commit/1e4c08d94f157e05e84a89b08dc9edf328f70735))

## [0.4.1](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.4.0...v0.4.1) (2023-06-01)


### Bug Fixes

* **containslocalizedfields:** fix logic, add tests ([#23](https://github.com/thompsonsj/payload-crowdin-sync/issues/23)) ([5650761](https://github.com/thompsonsj/payload-crowdin-sync/commit/565076183735db6ced89ab8e8f83565ed8cdb9c1))

## [0.4.0](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.3.0...v0.4.0) (2023-06-01)


### Features

* **afterchange:** respect an env variable to always update ([#22](https://github.com/thompsonsj/payload-crowdin-sync/issues/22)) ([b1b87a5](https://github.com/thompsonsj/payload-crowdin-sync/commit/b1b87a5d7e84230f7204aeb24d21830e7a482f44))
* support localization setting nested-field fields ([#20](https://github.com/thompsonsj/payload-crowdin-sync/issues/20)) ([561e8e2](https://github.com/thompsonsj/payload-crowdin-sync/commit/561e8e26e434602dc6d32ef452489a5cf6253325))

## [0.3.0](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.1.3...v0.3.0) (2023-06-01)


### Features

* **payload:** support nested json fields on translation update ([#13](https://github.com/thompsonsj/payload-crowdin-sync/issues/13)) ([4225b83](https://github.com/thompsonsj/payload-crowdin-sync/commit/4225b83d4cd6ed9f999b6412a493e0f693d40b08))
* **plugin:** support globals ([#6](https://github.com/thompsonsj/payload-crowdin-sync/issues/6)) ([80559ee](https://github.com/thompsonsj/payload-crowdin-sync/commit/80559ee4437f15a5b3fe1eda848a484a541979af))
* support collapsible fields, complete richText update support ([#18](https://github.com/thompsonsj/payload-crowdin-sync/issues/18)) ([3e37aba](https://github.com/thompsonsj/payload-crowdin-sync/commit/3e37abae34011e504af182ca2264a7929730c8ae))
* support updating group and array fields on CrowdIn ([#8](https://github.com/thompsonsj/payload-crowdin-sync/issues/8)) ([2401499](https://github.com/thompsonsj/payload-crowdin-sync/commit/2401499e8d5527aee2e4cc8357dd225a2eab4805))


### Bug Fixes

* **buildjsoncrowdinobject:** works with empty fields ([#15](https://github.com/thompsonsj/payload-crowdin-sync/issues/15)) ([d1e0d88](https://github.com/thompsonsj/payload-crowdin-sync/commit/d1e0d88109b4ed9a5c8dbcb00b2c41ab6d550d17))
* **package.json:** dependencies for local development ([#5](https://github.com/thompsonsj/payload-crowdin-sync/issues/5)) ([f73bf71](https://github.com/thompsonsj/payload-crowdin-sync/commit/f73bf71385097061c8e4302efa7f2126a12e9265))


### Documentation

* **readme:** update with translation sync information ([#19](https://github.com/thompsonsj/payload-crowdin-sync/issues/19)) ([4b86873](https://github.com/thompsonsj/payload-crowdin-sync/commit/4b86873034b7799015722e22fa6029a8d9c1df86))

### [0.1.3](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.1.2...v0.1.3) (2023-04-25)


### Bug Fixes

* **payload:** define localeMap manually ([#4](https://github.com/thompsonsj/payload-crowdin-sync/issues/4)) ([6d9a7df](https://github.com/thompsonsj/payload-crowdin-sync/commit/6d9a7df0abe6561896818afbf3e9f8c4bcf336f6))

### [0.1.2](https://github.com/thompsonsj/payload-crowdin-sync/compare/v0.1.1...v0.1.2) (2023-04-25)


### Bug Fixes

* **index:** exports ([#3](https://github.com/thompsonsj/payload-crowdin-sync/issues/3)) ([75cc7e8](https://github.com/thompsonsj/payload-crowdin-sync/commit/75cc7e8829c059a87a1af3239f7e02addf4de597))

### 0.1.1 (2023-04-25)
