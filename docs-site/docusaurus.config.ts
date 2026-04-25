import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const repo = process.env.GITHUB_REPOSITORY ?? 'thompsonsj/payload-crowdin-sync';
const [organizationName, projectName] = repo.split('/');
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const config: Config = {
  title: 'Payload Crowdin Sync',
  tagline: 'Sync Payload localized fields with Crowdin.',
  favicon: 'img/favicon.ico',
  trailingSlash: false,

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // GitHub Pages is served at https://<org>.github.io/<repo>/
  url: isGitHubPages ? `https://${organizationName}.github.io` : 'http://localhost:3000',
  baseUrl: isGitHubPages ? `/${projectName}/` : '/',

  // GitHub pages deployment config.
  organizationName, // Usually your GitHub org/user name.
  projectName, // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
        },
        blog: false,
        sitemap: {
          // Helps search engines discover all pages (GitHub Pages is static).
          changefreq: 'weekly',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  headTags: [
    // Lightweight "LLM discoverability" convention. Served at `<baseUrl>llms.txt`.
    {
      tagName: 'link',
      attributes: {
        rel: 'alternate',
        type: 'text/plain',
        href: `${isGitHubPages ? `/${projectName}` : ''}/llms.txt`,
        title: 'llms.txt',
      },
    },
  ],

  themeConfig: {
    metadata: [
      {
        name: 'keywords',
        content:
          'payload,payloadcms,crowdin,localization,i18n,translations,payload-plugin,lexical,slate',
      },
      {
        name: 'description',
        content:
          'Documentation for the payload-crowdin-sync plugin: sync Payload localized fields to Crowdin and load translations back into Payload.',
      },
    ],
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Payload Crowdin Sync',
      logo: {
        alt: 'Payload Crowdin Sync',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: `https://github.com/${organizationName}/${projectName}`,
          label: 'GitHub',
          position: 'right',
        },
        {
          href: `https://www.npmjs.com/package/payload-crowdin-sync`,
          label: 'npm',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Payload Crowdin Sync. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
