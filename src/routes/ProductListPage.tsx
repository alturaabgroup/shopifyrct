import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { shopifyFetch } from '../services/shopifyClient';
import { Image, useMoney } from '@shopify/hydrogen-react';

type Product = {
  id: string;
  title: string;
  handle: string;
  productType: string;
  vendor: string;
  availableForSale: boolean;
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
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
};

type ProductEdge = {
  node: Product;
};

type SortKey = 'RELEVANCE' | 'BEST_SELLING' | 'CREATED_AT' | 'PRICE' | 'TITLE';

const PRODUCTS_QUERY = /* GraphQL */ `
  query ProductsQuery(
    $first: Int!
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
  ) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query) {
      edges {
        node {
          id
          title
          handle
          productType
          vendor
          availableForSale
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
            maxVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const COLLECTIONS_QUERY = /* GraphQL */ `
  query CollectionsQuery($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          productsCount
        }
      }
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  query CollectionProducts(
    $handle: String!
    $first: Int!
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      id
      title
      description
      products(first: $first, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        edges {
          node {
            id
            title
            handle
            productType
            vendor
            availableForSale
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
              maxVariantPrice {
                amount
                currencyCode
              }
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Array<{ id: string; title: string; handle: string; productsCount: number }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [collectionTitle, setCollectionTitle] = useState<string>('');
  
  // Get filter params
  const collection = searchParams.get('collection');
  const sortBy = searchParams.get('sort') || 'BEST_SELLING';
  const productType = searchParams.get('type');
  const vendor = searchParams.get('vendor');
  const available = searchParams.get('available');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  // Fetch collections on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await shopifyFetch<{ collections: { edges: Array<{ node: any }> } }>(
          COLLECTIONS_QUERY,
          { first: 50 }
        );
        setCollections(data.collections.edges.map(e => e.node));
      } catch (err) {
        console.error('Failed to load collections', err);
      }
    })();
  }, []);

  // Fetch products based on filters
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        let sortKey: SortKey | string = sortBy;
        let reverse = false;

        // Handle special sort cases
        if (sortBy === 'PRICE_HIGH') {
          sortKey = 'PRICE';
          reverse = true;
        } else if (sortBy === 'PRICE_LOW') {
          sortKey = 'PRICE';
          reverse = false;
        } else if (sortBy === 'NEWEST') {
          sortKey = 'CREATED_AT';
          reverse = true;
        }

        if (collection) {
          // Fetch products from specific collection
          const filters: any[] = [];
          
          if (productType) {
            filters.push({ productType: productType });
          }
          if (vendor) {
            filters.push({ productVendor: vendor });
          }
          if (available === 'true') {
            filters.push({ available: true });
          }
          if (minPrice || maxPrice) {
            filters.push({
              price: {
                min: minPrice ? parseFloat(minPrice) : undefined,
                max: maxPrice ? parseFloat(maxPrice) : undefined
              }
            });
          }

          const data = await shopifyFetch<{ collection: { title: string; products: { edges: ProductEdge[] } } }>(
            COLLECTION_PRODUCTS_QUERY,
            {
              handle: collection,
              first: 50,
              sortKey: sortKey,
              reverse: reverse,
              filters: filters.length > 0 ? filters : undefined
            }
          );
          
          if (data.collection) {
            setCollectionTitle(data.collection.title);
            setProducts(data.collection.products.edges.map((e) => e.node));
          } else {
            setError('Collection not found');
          }
        } else {
          // Fetch all products with query filter
          let queryParts: string[] = [];
          
          if (productType) {
            queryParts.push(`product_type:${productType}`);
          }
          if (vendor) {
            queryParts.push(`vendor:${vendor}`);
          }
          if (available === 'true') {
            queryParts.push('available_for_sale:true');
          }

          const data = await shopifyFetch<{ products: { edges: ProductEdge[] } }>(
            PRODUCTS_QUERY,
            {
              first: 50,
              sortKey: sortKey,
              reverse: reverse,
              query: queryParts.length > 0 ? queryParts.join(' AND ') : undefined
            }
          );
          
          setCollectionTitle('');
          setProducts(data.products.edges.map((e) => e.node));
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Products query error', err);
        setError(err?.message ?? 'Failed to load products');
        setLoading(false);
      }
    })();
  }, [collection, sortBy, productType, vendor, available, minPrice, maxPrice]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  // Get unique product types and vendors from current products
  const productTypes = Array.from(new Set(products.map(p => p.productType).filter(Boolean)));
  const vendors = Array.from(new Set(products.map(p => p.vendor).filter(Boolean)));

  if (loading) return <div style={{ padding: '1rem' }}>Loading products...</div>;
  if (error) return <div style={{ padding: '1rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{collectionTitle || 'All Products'}</h1>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
        {/* Sidebar - Filters and Collections */}
        <div style={{ width: '250px', flexShrink: 0 }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Collections</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <button
                  onClick={() => updateFilter('collection', null)}
                  style={{
                    background: !collection ? '#000' : 'transparent',
                    color: !collection ? '#fff' : '#000',
                    border: 'none',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  All Products
                </button>
              </li>
              {collections.map((coll) => (
                <li key={coll.id} style={{ marginBottom: '0.5rem' }}>
                  <button
                    onClick={() => updateFilter('collection', coll.handle)}
                    style={{
                      background: collection === coll.handle ? '#000' : 'transparent',
                      color: collection === coll.handle ? '#fff' : '#000',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    {coll.title} ({coll.productsCount})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => updateFilter('sort', e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
            >
              <option value="RELEVANCE">Relevance</option>
              <option value="BEST_SELLING">Best Selling</option>
              <option value="NEWEST">Newest</option>
              <option value="PRICE_LOW">Price: Low to High</option>
              <option value="PRICE_HIGH">Price: High to Low</option>
              <option value="TITLE">Title: A-Z</option>
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Filters</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={available === 'true'}
                  onChange={(e) => updateFilter('available', e.target.checked ? 'true' : null)}
                />
                {' '}In Stock Only
              </label>
            </div>

            {productTypes.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                  Product Type
                </label>
                <select
                  value={productType || ''}
                  onChange={(e) => updateFilter('type', e.target.value || null)}
                  style={{ width: '100%', padding: '0.25rem' }}
                >
                  <option value="">All Types</option>
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {vendors.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                  Vendor
                </label>
                <select
                  value={vendor || ''}
                  onChange={(e) => updateFilter('vendor', e.target.value || null)}
                  style={{ width: '100%', padding: '0.25rem' }}
                >
                  <option value="">All Vendors</option>
                  {vendors.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(productType || vendor || available) && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '0.5rem',
                  width: '100%',
                  cursor: 'pointer',
                  background: '#f0f0f0',
                  border: '1px solid #ddd'
                }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '1rem', color: '#666' }}>
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </div>
          
          {products.length === 0 ? (
            <div>No products found matching your filters.</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}
            >
              {products.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.handle}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ border: '1px solid #eee', padding: '0.5rem', position: 'relative' }}>
                    {!p.availableForSale && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: '#666',
                          color: '#fff',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        Out of Stock
                      </div>
                    )}
                    {p.featuredImage && (
                      <Image
                        data={p.featuredImage}
                        alt={p.featuredImage.altText ?? p.title}
                        loading="lazy"
                        sizes="(min-width: 768px) 25vw, 50vw"
                        style={{ width: '100%', height: 'auto' }}
                      />
                    )}
                    <h2 style={{ fontSize: '1rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                      {p.title}
                    </h2>
                    {p.vendor && (
                      <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                        {p.vendor}
                      </div>
                    )}
                    <p style={{ fontWeight: 'bold', margin: 0 }}>
                      <Price
                        amount={p.priceRange.minVariantPrice.amount}
                        currencyCode={p.priceRange.minVariantPrice.currencyCode}
                      />
                      {p.priceRange.minVariantPrice.amount !== p.priceRange.maxVariantPrice.amount && (
                        <>
                          {' - '}
                          <Price
                            amount={p.priceRange.maxVariantPrice.amount}
                            currencyCode={p.priceRange.maxVariantPrice.currencyCode}
                          />
                        </>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;