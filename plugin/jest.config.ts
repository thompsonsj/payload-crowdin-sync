const esModules = [
  'payload',
  '@payloadcms/translations',
  '@payloadcms/db-mongodb',
  '@payloadcms',
  '@payloadcms/graphql',
  '@payloadcms/next',
  '@payloadcms/email-nodemailer',
  '@payloadcms/payload-cloud',
  '@payloadcms/plugin-seo',
  '@payloadcms/richtext-lexical',
  '@payloadcms/richtext-slate',
  '@payloadcms/ui',
  'node-fetch',
  'data-uri-to-buffer',
  'fetch-blob',
  'formdata-polyfill',
  // file-type and all dependencies: https://github.com/sindresorhus/file-type
  'file-type',
  'strtok3',
  'readable-web-to-node-stream',
  'token-types',
  'peek-readable',
  'locate-path',
  'p-locate',
  'p-limit',
  'yocto-queue',
  'unicorn-magic',
  'path-exists',
  'qs-esm',
  'uint8array-extras',
].join('|')

const config = {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  displayName: 'plugin',
  // preset: '../jest.preset.js',
  transformIgnorePatterns: [
    `/node_modules/(?!.pnpm)(?!(${esModules})/)`,
    `/node_modules/.pnpm/(?!(${esModules.replace(/\//g, '\\+')})@)`,
  ],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/test/helpers/mocks/emptyModule.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/test/helpers/mocks/fileMock.js',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/plugin',
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  verbose: true,
  prettierPath: require.resolve('prettier-2'),
};

export default config;
