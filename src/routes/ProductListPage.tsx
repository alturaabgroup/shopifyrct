import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shopifyFetch } from '../services/shopifyClient';
import { Image } from '@shopify/hydrogen-react';
import { useMoney } from '@shopify/hydrogen-react';

type Product = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
};

const PRODUCTS_QUERY = /* GraphQL */ `
  query ProductsQuery {
    products(first: 20, sortKey: BEST_SELLING) {
      edges {
        node {
          id
          title
          handle
          featuredImage {
            url(transform: { maxWidth: 400, maxHeight: 400 })
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

function Price({ amount, currencyCode }: { amount: string; currencyCode: string }) {
  const money = useMoney({ amount, currencyCode });
  return <>{money.localizedString}</>;
}

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await shopifyFetch<{ products: { edges: { node: any }[] } }>(
          PRODUCTS_QUERY
        );
        setProducts(data.products.edges.map((e) => e.node));
        setLoading(false);
      } catch (err: any) {
        console.error('Products query error', err);
        setError(err?.message ?? 'Failed to load products');
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products: {error}</div>;

  return (
    <div>
      <h1>Products</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem'
        }}
      >
        {products.map((p) => (
          <Link
            key={p.id}
            to={`/products/${p.handle}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ border: '1px solid #eee', padding: '0.5rem' }}>
              {p.featuredImage && (
                <Image
                  data={p.featuredImage}
                  alt={p.featuredImage.altText ?? p.title}
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 50vw"
                  style={{ width: '100%', height: 'auto' }}
                />
              )}
              <h2 style={{ fontSize: '1rem', marginTop: '0.5rem' }}>{p.title}</h2>
              <p>
                <Price
                  amount={p.priceRange.minVariantPrice.amount}
                  currencyCode={p.priceRange.minVariantPrice.currencyCode}
                />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductListPage;