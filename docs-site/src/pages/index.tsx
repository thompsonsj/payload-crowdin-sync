import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const features: {title: string; description: string}[] = [
  {
    title: 'Uploads on save',
    description:
      'Localized fields in collections and globals are sent to Crowdin when you save a draft or publish. Only fields that changed are uploaded again.',
  },
  {
    title: 'Rich text as HTML',
    description:
      'Slate and Lexical fields become HTML that translators can edit in Crowdin, including Lexical blocks, uploads, relationships and tables.',
  },
  {
    title: 'Any nesting',
    description:
      'Localized fields inside groups, arrays, blocks, tabs, collapsibles and rows are found and written back to the right place.',
  },
  {
    title: 'Translations in one click',
    description:
      'Tick a checkbox to load translations as a draft or published version. Review changes first over REST, or queue them as Payload jobs.',
  },
  {
    title: 'Safe updates',
    description:
      'A translation that is missing a required field is not applied, and the validation errors are reported.',
  },
  {
    title: 'Self-healing',
    description:
      'If files or folders are deleted in Crowdin, the plugin cleans up its records and creates them again on the next save.',
  },
];

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className="container margin-vert--lg">
        <Heading as="h1">{siteConfig.title}</Heading>
        <p className="margin-bottom--md">{siteConfig.tagline}</p>
        <p className="margin-bottom--lg">
          The plugin extracts localized fields from your Payload documents and
          uploads them to Crowdin as clean HTML and JSON files. When
          translations are ready, it writes them back into the right fields,
          however deeply nested.
        </p>
        <div className="margin-bottom--xl">
          <Link className="button button--primary button--lg margin-right--md" to="/docs/intro">
            Read the docs
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/plugin">
            Get started
          </Link>
        </div>
        <div className="row">
          {features.map(({title, description}) => (
            <div key={title} className="col col--4 margin-bottom--lg">
              <Heading as="h3">{title}</Heading>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
