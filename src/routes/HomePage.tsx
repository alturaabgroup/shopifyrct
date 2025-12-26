import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shopifyFetch } from '../services/shopifyClient';

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const query = `
          query FeaturedProducts {
            products(first: 8, sortKey: BEST_SELLING) {
              edges {
                node {
                  id
                  title
                  handle
                  featuredImage {
                    url
                    altText
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
        
        const response = await shopifyFetch<{ products: { edges: Array<{ node: Product }> } }>(query);
        setFeaturedProducts(response.products.edges.map(edge => edge.node));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container-custom py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 md:mb-6 leading-tight">
              Premium Corporate & School Uniforms
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Discover our curated collection of high-quality uniforms designed for comfort, durability, and professional style
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products?collection=corporate-uniforms" className="btn btn-primary text-center">
                Shop Corporate
              </Link>
              <Link to="/products?collection=school-uniforms" className="btn btn-secondary text-center">
                Shop School Uniforms
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Categories Section */}
      <section className="container-custom py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-8 md:mb-12">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Corporate Uniforms */}
          <Link to="/products?collection=corporate-uniforms" className="group">
            <div className="card hover:shadow-hard transition-all duration-300 overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <svg className="w-16 h-16 md:w-20 md:h-20 text-gray-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">Corporate</h3>
                <p className="text-sm text-gray-500 mt-1">Professional Attire</p>
              </div>
            </div>
          </Link>

          {/* School Uniforms */}
          <Link to="/products?collection=school-uniforms" className="group">
            <div className="card hover:shadow-hard transition-all duration-300 overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <svg className="w-16 h-16 md:w-20 md:h-20 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">School</h3>
                <p className="text-sm text-gray-500 mt-1">Student Essentials</p>
              </div>
            </div>
          </Link>

          {/* Accessories */}
          <Link to="/products?productType=Accessories" className="group">
            <div className="card hover:shadow-hard transition-all duration-300 overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <svg className="w-16 h-16 md:w-20 md:h-20 text-amber-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">Accessories</h3>
                <p className="text-sm text-gray-500 mt-1">Complete the Look</p>
              </div>
            </div>
          </Link>

          {/* View All */}
          <Link to="/collections" className="group">
            <div className="card hover:shadow-hard transition-all duration-300 overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <svg className="w-16 h-16 md:w-20 md:h-20 text-purple-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">View All</h3>
                <p className="text-sm text-gray-500 mt-1">Browse Collections</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold">Trending Products</h2>
            <Link to="/products" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <Link key={product.id} to={`/products/${product.handle}`} className="group">
                  <div className="card hover:shadow-hard transition-all duration-300">
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      {product.featuredImage ? (
                        <img
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText || product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition line-clamp-2 mb-2">
                        {product.title}
                      </h3>
                      <p className="price">
                        ₹{parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Free Shipping</h3>
            <p className="text-gray-600 text-sm">On orders above ₹999</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Quality Assured</h3>
            <p className="text-gray-600 text-sm">Premium materials & craftsmanship</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
            <p className="text-gray-600 text-sm">7-day hassle-free returns</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container-custom py-12 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
            Bulk Orders & Custom Requirements?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            We specialize in bulk orders for corporations and schools. Get in touch for custom sizing, branding, and special pricing.
          </p>
          <Link to="/pages" className="btn btn-secondary inline-flex items-center gap-2">
            Contact Us
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;