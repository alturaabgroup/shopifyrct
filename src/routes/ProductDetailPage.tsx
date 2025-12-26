import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
};

type ImageType = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type Product = {
  id: string;
  title: string;
  descriptionHtml: string;
  vendor?: string;
  productType?: string;
  featuredImage?: ImageType | null;
  images: ImageType[];
  variants: Variant[];
  options: Array<{
    name: string;
    values: string[];
  }>;
};

const PRODUCT_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      descriptionHtml
      vendor
      productType
      featuredImage {
        url(transform: { maxWidth: 800, maxHeight: 800 })
        altText
        width
        height
      }
      images(first: 10) {
        edges {
          node {
            url(transform: { maxWidth: 800, maxHeight: 800 })
            altText
            width
            height
          }
        }
      }
      options {
        name
        values
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'shipping'>('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    if (!handle) return;
    (async () => {
      setLoading(true);
      try {
        const data = await shopifyFetch<{ product: any }>(PRODUCT_QUERY, { handle });
        if (!data.product) throw new Error('Product not found');
        const prod = data.product;
        
        const variants: Variant[] = prod.variants.edges?.map((e: any) => ({
          id: e.node.id,
          title: e.node.title,
          availableForSale: e.node.availableForSale,
          price: e.node.price,
          selectedOptions: e.node.selectedOptions
        })) ?? [];
        
        const images: ImageType[] = prod.images.edges?.map((e: any) => e.node) ?? [];
        
        setProduct({
          id: prod.id,
          title: prod.title,
          descriptionHtml: prod.descriptionHtml,
          vendor: prod.vendor,
          productType: prod.productType,
          featuredImage: prod.featuredImage,
          images: images.length > 0 ? images : (prod.featuredImage ? [prod.featuredImage] : []),
          variants,
          options: prod.options || []
        });
        
        // Initialize with first variant
        const firstVariant = variants[0];
        if (firstVariant) {
          setSelectedVariantId(firstVariant.id);
          const initialOptions: Record<string, string> = {};
          firstVariant.selectedOptions.forEach(opt => {
            initialOptions[opt.name] = opt.value;
          });
          setSelectedOptions(initialOptions);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Product query error', err);
        setError(err?.message ?? 'Failed to load product');
        setLoading(false);
      }
    })();
  }, [handle]);

  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);
    
    // Find matching variant
    const matchingVariant = product?.variants.find(variant => 
      variant.selectedOptions.every(opt => newOptions[opt.name] === opt.value)
    );
    
    if (matchingVariant) {
      setSelectedVariantId(matchingVariant.id);
    }
  };

  async function handleAddToCart() {
    if (!selectedVariantId) return;
    setAdding(true);
    try {
      await addItem(selectedVariantId, quantity);
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-semibold">Product not found</p>
          <p className="text-sm">{error || 'The product you are looking for does not exist.'}</p>
          <Link to="/products" className="text-sm underline mt-2 inline-block">
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const currentImage = product.images[selectedImageIndex];

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium truncate">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {currentImage ? (
                <Image
                  data={currentImage}
                  alt={currentImage.altText ?? product.title}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      idx === selectedImageIndex ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      data={img}
                      alt={img.altText ?? `${product.title} - Image ${idx + 1}`}
                      sizes="150px"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              {product.vendor && (
                <p className="text-sm text-gray-600 mb-2">{product.vendor}</p>
              )}
              <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                {product.title}
              </h1>
              {selectedVariant && (
                <p className="text-3xl font-bold text-gray-900">
                  ₹<Money amount={selectedVariant.price.amount} currencyCode={selectedVariant.price.currencyCode} />
                </p>
              )}
              {product.productType && (
                <p className="text-sm text-gray-600 mt-2">{product.productType}</p>
              )}
            </div>

            {/* Variant Options */}
            {product.options.filter(opt => opt.values.length > 1).map((option) => (
              <div key={option.name}>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {option.name}: <span className="font-normal text-gray-600">{selectedOptions[option.name]}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const isSelected = selectedOptions[option.name] === value;
                    // Check if this option value is available
                    const testOptions = { ...selectedOptions, [option.name]: value };
                    const isAvailable = product.variants.some(v => 
                      v.availableForSale && v.selectedOptions.every(opt => testOptions[opt.name] === opt.value)
                    );
                    
                    return (
                      <button
                        key={value}
                        onClick={() => handleOptionChange(option.name, value)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                          isSelected
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : isAvailable
                            ? 'border-gray-300 hover:border-gray-900'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed line-through'
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Size Guide Link */}
            <button
              onClick={() => setShowSizeGuide(true)}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              View Size Guide
            </button>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-semibold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-10 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant?.availableForSale || adding || cartLoading}
                className="btn btn-primary w-full text-lg"
              >
                {adding || cartLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : !selectedVariant?.availableForSale ? (
                  'Out of Stock'
                ) : (
                  'Add to Cart'
                )}
              </button>

              {selectedVariant?.availableForSale && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  In Stock - Ready to Ship
                </p>
              )}
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Free shipping on orders above ₹999
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Easy 7-day returns
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure payment
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 border-b-2 font-medium transition ${
                  activeTab === 'description' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-4 border-b-2 font-medium transition ${
                  activeTab === 'details' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-4 border-b-2 font-medium transition ${
                  activeTab === 'shipping' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Shipping & Returns
              </button>
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                className="prose max-w-none"
              />
            )}
            {activeTab === 'details' && (
              <div className="space-y-4">
                {product.vendor && (
                  <div className="flex gap-2">
                    <span className="font-semibold w-32">Brand:</span>
                    <span>{product.vendor}</span>
                  </div>
                )}
                {product.productType && (
                  <div className="flex gap-2">
                    <span className="font-semibold w-32">Type:</span>
                    <span>{product.productType}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="font-semibold w-32">Material:</span>
                  <span>Premium quality fabric</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold w-32">Care:</span>
                  <span>Machine wash cold, tumble dry low</span>
                </div>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <p>We offer fast and reliable shipping on all orders.</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Free shipping on orders above ₹999</li>
                  <li>Standard delivery: 3-5 business days</li>
                  <li>Express delivery: 1-2 business days (additional charges apply)</li>
                  <li>Easy returns within 7 days of delivery</li>
                  <li>Products must be in original condition with tags attached</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowSizeGuide(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display font-bold">Size Guide</h2>
                  <button onClick={() => setShowSizeGuide(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Size</th>
                        <th className="text-left py-3 px-4">Chest (inches)</th>
                        <th className="text-left py-3 px-4">Length (inches)</th>
                        <th className="text-left py-3 px-4">Shoulder (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="py-3 px-4">XS</td><td className="py-3 px-4">34-36</td><td className="py-3 px-4">26-27</td><td className="py-3 px-4">15-16</td></tr>
                      <tr className="border-b"><td className="py-3 px-4">S</td><td className="py-3 px-4">36-38</td><td className="py-3 px-4">27-28</td><td className="py-3 px-4">16-17</td></tr>
                      <tr className="border-b"><td className="py-3 px-4">M</td><td className="py-3 px-4">38-40</td><td className="py-3 px-4">28-29</td><td className="py-3 px-4">17-18</td></tr>
                      <tr className="border-b"><td className="py-3 px-4">L</td><td className="py-3 px-4">40-42</td><td className="py-3 px-4">29-30</td><td className="py-3 px-4">18-19</td></tr>
                      <tr className="border-b"><td className="py-3 px-4">XL</td><td className="py-3 px-4">42-44</td><td className="py-3 px-4">30-31</td><td className="py-3 px-4">19-20</td></tr>
                      <tr><td className="py-3 px-4">XXL</td><td className="py-3 px-4">44-46</td><td className="py-3 px-4">31-32</td><td className="py-3 px-4">20-21</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductDetailPage;