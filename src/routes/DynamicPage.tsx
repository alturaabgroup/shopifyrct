import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { shopifyFetch } from '../services/shopifyClient';

type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  seo?: {
    title?: string | null;
    description?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

const PAGE_QUERY = /* GraphQL */ `
  query PageByHandle($handle: String!) {
    page(handle: $handle) {
      id
      title
      handle
      body
      seo {
        title
        description
      }
      createdAt
      updatedAt
    }
  }
`;

const DynamicPage: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) {
      setNotFound(true);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await shopifyFetch<{ page: Page | null }>(PAGE_QUERY, { handle });

        if (!data.page) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setPage(data.page);
        
        // Update document title for SEO
        if (data.page.seo?.title) {
          document.title = data.page.seo.title;
        } else {
          document.title = data.page.title;
        }

        // Update meta description for SEO
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && data.page.seo?.description) {
          metaDescription.setAttribute('content', data.page.seo.description);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Page fetch error:', err);
        setError(err?.message ?? 'Failed to load page');
        setLoading(false);
      }
    })();
  }, [handle]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading page...</div>
      </div>
    );
  }

  if (notFound) {
    return <Navigate to="/404" replace />;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ color: 'red' }}>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!page) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <article>
        <header style={{ marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{page.title}</h1>
          <div style={{ color: '#666', fontSize: '0.875rem' }}>
            Last updated: {new Date(page.updatedAt).toLocaleDateString()}
          </div>
        </header>
        
        <div
          style={{
            lineHeight: '1.8',
            fontSize: '1.1rem',
            color: '#333'
          }}
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </article>
    </div>
  );
};

export default DynamicPage;
