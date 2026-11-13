import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const features: {title: string; description: string}[] = [
  {
    title: 'Few files per document',
    description:
      'Each document becomes one fields.json plus an HTML file per rich text field. Nested Lexical blocks get their own small folders. Translators open a folder per page, not a file per field.',
  },
  {
    title: 'Only translatable strings',
    description:
      'Numbers, selects, dates, uploads and relationships stay in Payload. Exclude slugs or other generated text. Translators never see editor state or field IDs.',
  },
  {
    title: 'Any nesting, including Lexical blocks',
    description:
      'Groups, arrays, blocks, tabs, collapsibles and rows are walked. Blocks embedded in Lexical rich text are extracted and translated as their own small documents.',
  },
  {
    title: 'Rich text as HTML',
    description:
      'Slate and Lexical fields become HTML that translators can edit in Crowdin, including uploads, relationships and tables. The plugin converts them back to editor state on the way in.',
  },
  {
    title: 'Uploads on save',
    description:
      'Localized fields in collections and globals are sent to Crowdin when you save a draft or publish. Only fields that changed are uploaded again.',
  },
  {
    title: 'Translations in one click',
    description:
      'Tick a checkbox to load translations as a draft or published version. Review changes first over REST, or queue them as Payload jobs. Missing required fields are not applied.',
  },
];

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className="container margin-vert--lg">
        <Heading as="h1">{siteConfig.title}</Heading>
        <p className="margin-bottom--md">{siteConfig.tagline}</p>
        <p>
          The advantage is the format translators get. Nested Payload
          documents, including blocks embedded in Lexical rich text, are
          rebuilt as HTML and JSON in Crowdin. File count stays low: one{' '}
          <code>fields.json</code>, one HTML file per rich text field, and a
          small folder per Lexical block.
        </p>
        <p className="margin-bottom--lg">
          Numbers, selects, dates, uploads, relationships, and fields you
          exclude stay in Payload. When translations are ready, they are
          written back into the same nested structure.
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
