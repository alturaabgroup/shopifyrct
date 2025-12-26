import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shopifyFetch } from '../services/shopifyClient';
import { Image } from '@shopify/hydrogen-react';

type Collection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productsCount: number;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

const COLLECTIONS_QUERY = /* GraphQL */ `
  query CollectionsQuery($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url(transform: { maxWidth: 600, maxHeight: 400 })
            altText
            width
            height
          }
          products(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;

const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await shopifyFetch<{ collections: { edges: Array<{ node: any }> } }>(
          COLLECTIONS_QUERY,
          { first: 50 }
        );
        
        const collectionsData = data.collections.edges.map((e) => ({
          id: e.node.id,
          title: e.node.title,
          handle: e.node.handle,
          description: e.node.description,
          productsCount: e.node.products.edges.length > 0 ? e.node.products.edges.length : 0,
          image: e.node.image
        }));
        
        setCollections(collectionsData);
        setLoading(false);
      } catch (err: any) {
        console.error('Collections query error', err);
        setError(err?.message ?? 'Failed to load collections');
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: '1rem' }}>Loading collections...</div>;
  if (error) return <div style={{ padding: '1rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Shop by Collection</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Browse our curated collections of products
      </p>
      
      {collections.length === 0 ? (
        <div>No collections available.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}
        >
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/products?collection=${collection.handle}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  border: '1px solid #eee',
                  padding: '1rem',
                  borderRadius: '8px',
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {collection.image && (
                  <Image
                    data={collection.image}
                    alt={collection.image.altText ?? collection.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '1rem'
                    }}
                  />
                )}
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', marginTop: 0 }}>
                  {collection.title}
                </h2>
                {collection.description && (
                  <p
                    style={{
                      color: '#666',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {collection.description.substring(0, 150)}
                    {collection.description.length > 150 ? '...' : ''}
                  </p>
                )}
                <div
                  style={{
                    marginTop: '1rem',
                    color: '#000',
                    fontWeight: 'bold',
                    textDecoration: 'underline'
                  }}
                >
                  Shop Collection →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
