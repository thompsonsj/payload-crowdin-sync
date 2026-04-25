import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className="container margin-vert--lg">
        <Heading as="h1">{siteConfig.title}</Heading>
        <p className="margin-bottom--lg">{siteConfig.tagline}</p>
        <Link className="button button--primary button--lg" to="/docs/intro">
          Read the docs
        </Link>
      </main>
    </Layout>
  );
}
