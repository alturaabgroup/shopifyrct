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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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

  const activeFiltersCount = [productType, vendor, available].filter(Boolean).length;

  // Filter Sidebar Component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Collections */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Collections</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => { updateFilter('collection', null); setMobileFiltersOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${
                !collection 
                  ? 'bg-gray-900 text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              All Products
            </button>
          </li>
          {collections.map((coll) => (
            <li key={coll.id}>
              <button
                onClick={() => { updateFilter('collection', coll.handle); setMobileFiltersOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  collection === coll.handle 
                    ? 'bg-gray-900 text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="flex justify-between items-center">
                  <span>{coll.title}</span>
                  <span className="text-xs opacity-70">({coll.productsCount})</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="RELEVANCE">Relevance</option>
          <option value="BEST_SELLING">Best Selling</option>
          <option value="NEWEST">Newest</option>
          <option value="PRICE_LOW">Price: Low to High</option>
          <option value="PRICE_HIGH">Price: High to Low</option>
          <option value="TITLE">Title: A-Z</option>
        </select>
      </div>

      {/* Filters */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>
        
        {/* In Stock */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={available === 'true'}
              onChange={(e) => updateFilter('available', e.target.checked ? 'true' : null)}
              className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <span className="text-sm">In Stock Only</span>
          </label>
        </div>

        {/* Product Type */}
        {productTypes.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <select
              value={productType || ''}
              onChange={(e) => updateFilter('type', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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

        {/* Vendor */}
        {vendors.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor
            </label>
            <select
              value={vendor || ''}
              onChange={(e) => updateFilter('vendor', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={() => { clearFilters(); setMobileFiltersOpen(false); }}
            className="w-full btn btn-secondary"
          >
            Clear All Filters ({activeFiltersCount})
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="product-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading products</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-custom py-6 md:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
            {collectionTitle || 'All Products'}
          </h1>
          <p className="text-gray-600 mt-1">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Mobile Filter & View Toggle Bar */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="badge bg-gray-900 text-white">{activeFiltersCount}</span>
            )}
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop View Toggle */}
        <div className="hidden lg:flex justify-end mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300'}`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300'}`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Products Area */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="btn btn-primary">
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="product-grid">
                {products.map((p) => (
                  <Link key={p.id} to={`/products/${p.handle}`} className="group">
                    <div className="card hover:shadow-hard transition-all duration-300">
                      <div className="aspect-square overflow-hidden bg-gray-100 relative">
                        {!p.availableForSale && (
                          <span className="badge absolute top-2 right-2 z-10">
                            Out of Stock
                          </span>
                        )}
                        {p.featuredImage ? (
                          <Image
                            data={p.featuredImage}
                            alt={p.featuredImage.altText ?? p.title}
                            loading="lazy"
                            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        {p.vendor && (
                          <p className="text-xs text-gray-500 mb-1">{p.vendor}</p>
                        )}
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition line-clamp-2 mb-2">
                          {p.title}
                        </h3>
                        <p className="price">
                          ₹<Price
                            amount={p.priceRange.minVariantPrice.amount}
                            currencyCode={p.priceRange.minVariantPrice.currencyCode}
                          />
                          {p.priceRange.minVariantPrice.amount !== p.priceRange.maxVariantPrice.amount && (
                            <>
                              {' - '}₹<Price
                                amount={p.priceRange.maxVariantPrice.amount}
                                currencyCode={p.priceRange.maxVariantPrice.currencyCode}
                              />
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((p) => (
                  <Link key={p.id} to={`/products/${p.handle}`} className="group">
                    <div className="card hover:shadow-hard transition-all duration-300 flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-48 aspect-square flex-shrink-0 overflow-hidden bg-gray-100 relative">
                        {!p.availableForSale && (
                          <span className="badge absolute top-2 right-2 z-10">
                            Out of Stock
                          </span>
                        )}
                        {p.featuredImage ? (
                          <Image
                            data={p.featuredImage}
                            alt={p.featuredImage.altText ?? p.title}
                            loading="lazy"
                            sizes="200px"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 sm:p-0 sm:py-2">
                        {p.vendor && (
                          <p className="text-sm text-gray-500 mb-1">{p.vendor}</p>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition mb-2">
                          {p.title}
                        </h3>
                        {p.productType && (
                          <p className="text-sm text-gray-600 mb-3">{p.productType}</p>
                        )}
                        <p className="text-xl font-bold text-gray-900">
                          ₹<Price
                            amount={p.priceRange.minVariantPrice.amount}
                            currencyCode={p.priceRange.minVariantPrice.currencyCode}
                          />
                          {p.priceRange.minVariantPrice.amount !== p.priceRange.maxVariantPrice.amount && (
                            <>
                              {' - '}₹<Price
                                amount={p.priceRange.maxVariantPrice.amount}
                                currencyCode={p.priceRange.maxVariantPrice.currencyCode}
                              />
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setMobileFiltersOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-white z-50 shadow-xl overflow-y-auto lg:hidden">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-bold">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductListPage;