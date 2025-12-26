import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shopifyFetch } from '../services/shopifyClient';
import { useCart } from '../context/CartContext';
import { Image, useMoney } from '@shopify/hydrogen-react';

type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
};

type Product = {
  id: string;
  title: string;
  descriptionHtml: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  variants: Variant[];
};

const PRODUCT_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      descriptionHtml
      featuredImage {
        url(transform: { maxWidth: 800, maxHeight: 800 })
        altText
        width
        height
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

function Money({ amount, currencyCode }: { amount: string; currencyCode: string }) {
  const money = useMoney({ amount, currencyCode });
  return <>{money.localizedString}</>;
}

const ProductDetailPage: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const { addItem, loading: cartLoading } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<boolean>(false);

  useEffect(() => {
    if (!handle) return;
    (async () => {
      setLoading(true);
      try {
        const data = await shopifyFetch<{ product: any }>(PRODUCT_QUERY, { handle });
        if (!data.product) throw new Error('Product not found');
        const prod = data.product;
        const variants: Variant[] =
          prod.variants.edges?.map((e: any) => ({
            id: e.node.id,
            title: e.node.title,
            availableForSale: e.node.availableForSale,
            price: e.node.price
          })) ?? [];
        setProduct({
          id: prod.id,
          title: prod.title,
          descriptionHtml: prod.descriptionHtml,
          featuredImage: prod.featuredImage,
          variants
        });
        setSelectedVariantId(variants[0]?.id ?? null);
        setLoading(false);
      } catch (err: any) {
        console.error('Product query error', err);
        setError(err?.message ?? 'Failed to load product');
        setLoading(false);
      }
    })();
  }, [handle]);

  async function handleAddToCart() {
    if (!selectedVariantId) return;
    setAdding(true);
    try {
      await addItem(selectedVariantId, 1);
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div>Loading product...</div>;
  if (error || !product) return <div>Error: {error ?? 'Product not found'}</div>;

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

  return (
    <div>
      <h1>{product.title}</h1>
      {product.featuredImage && (
        <Image
          data={product.featuredImage}
          alt={product.featuredImage.altText ?? product.title}
          sizes="(min-width: 768px) 50vw, 100vw"
          style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
      )}

      <div style={{ margin: '1rem 0' }}>
        <label>
          Variant:{' '}
          <select
            value={selectedVariantId ?? ''}
            onChange={(e) => setSelectedVariantId(e.target.value)}
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id} disabled={!v.availableForSale}>
                {v.title} - <Money amount={v.price.amount} currencyCode={v.price.currencyCode} />{' '}
                {!v.availableForSale ? '(Sold out)' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        style={{ marginBottom: '1rem' }}
      />

      <button
        onClick={handleAddToCart}
        disabled={!selectedVariant?.availableForSale || adding || cartLoading}
      >
        {adding || cartLoading ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default ProductDetailPage;