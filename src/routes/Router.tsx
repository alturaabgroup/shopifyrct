import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import HomePage from './HomePage';
import CollectionsPage from './CollectionsPage';
import ProductListPage from './ProductListPage';
import ProductDetailPage from './ProductDetailPage';
import CartPage from './CartPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import AccountPage from './AccountPage';
import DynamicPage from './DynamicPage';
import PagesListPage from './PagesListPage';
import PolicyPage from './PolicyPage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initialized, customer } = useAuth();
  if (!initialized) {
    return <div>Loading session...</div>;
  }
  if (!customer) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Footer: React.FC = () => {
  const { shop, pages, policies } = useStore();

  // Get first few pages for footer navigation
  const footerPages = pages.slice(0, 5);
  const hasPolicies = Object.values(policies).some(policy => policy !== null);

  return (
    <footer style={{ 
      borderTop: '1px solid #ddd', 
      background: '#f8f8f8', 
      marginTop: '4rem',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Shop Info */}
          <div>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>
              {shop?.name || 'Our Store'}
            </h3>
            {shop?.description && (
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {shop.description}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Quick Links</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/collections" style={{ color: '#333', textDecoration: 'none' }}>
                  Collections
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/products" style={{ color: '#333', textDecoration: 'none' }}>
                  All Products
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/cart" style={{ color: '#333', textDecoration: 'none' }}>
                  Shopping Cart
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/account" style={{ color: '#333', textDecoration: 'none' }}>
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Pages */}
          {footerPages.length > 0 && (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Information</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {footerPages.map((page) => (
                  <li key={page.id} style={{ marginBottom: '0.5rem' }}>
                    <Link 
                      to={`/pages/${page.handle}`} 
                      style={{ color: '#333', textDecoration: 'none' }}
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
                {pages.length > 5 && (
                  <li style={{ marginBottom: '0.5rem' }}>
                    <Link to="/pages" style={{ color: '#333', textDecoration: 'none' }}>
                      View All Pages
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Policies */}
          {hasPolicies && (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Policies</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {policies.privacyPolicy && (
                  <li style={{ marginBottom: '0.5rem' }}>
                    <Link 
                      to="/pages/policies/privacy-policy" 
                      style={{ color: '#333', textDecoration: 'none' }}
                    >
                      {policies.privacyPolicy.title}
                    </Link>
                  </li>
                )}
                {policies.termsOfService && (
                  <li style={{ marginBottom: '0.5rem' }}>
                    <Link 
                      to="/pages/policies/terms-of-service" 
                      style={{ color: '#333', textDecoration: 'none' }}
                    >
                      {policies.termsOfService.title}
                    </Link>
                  </li>
                )}
                {policies.refundPolicy && (
                  <li style={{ marginBottom: '0.5rem' }}>
                    <Link 
                      to="/pages/policies/refund-policy" 
                      style={{ color: '#333', textDecoration: 'none' }}
                    >
                      {policies.refundPolicy.title}
                    </Link>
                  </li>
                )}
                {policies.shippingPolicy && (
                  <li style={{ marginBottom: '0.5rem' }}>
                    <Link 
                      to="/pages/policies/shipping-policy" 
                      style={{ color: '#333', textDecoration: 'none' }}
                    >
                      {policies.shippingPolicy.title}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div style={{ 
          borderTop: '1px solid #ddd', 
          paddingTop: '1rem', 
          textAlign: 'center',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} {shop?.name || 'Store'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { customer, logout } = useAuth();
  const { cart } = useCart();
  const { shop } = useStore();
  
  const cartItemCount = cart?.lines.reduce((sum, line) => sum + line.quantity, 0) || 0;
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', borderBottom: '1px solid #ddd', background: '#f8f8f8' }}>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', color: '#000' }}>
            {shop?.brand?.logo?.image?.url ? (
              <img 
                src={shop.brand.logo.image.url} 
                alt={shop.brand.logo.image.altText || shop.name || 'Store Logo'}
                style={{ height: '40px', objectFit: 'contain' }}
              />
            ) : (
              shop?.name || 'Shop'
            )}
          </Link>
          <Link to="/collections" style={{ textDecoration: 'none', color: '#000' }}>Collections</Link>
          <Link to="/products" style={{ textDecoration: 'none', color: '#000' }}>All Products</Link>
          <Link to="/pages" style={{ textDecoration: 'none', color: '#000' }}>Pages</Link>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/cart" style={{ textDecoration: 'none', color: '#000', position: 'relative' }}>
              Cart
              {cartItemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-12px',
                  background: '#000',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem'
                }}>
                  {cartItemCount}
                </span>
              )}
            </Link>
            {customer ? (
              <>
                <Link to="/account" style={{ textDecoration: 'none', color: '#000' }}>Account</Link>
                <button 
                  onClick={logout}
                  style={{
                    background: 'transparent',
                    border: '1px solid #000',
                    padding: '0.25rem 0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: 'none', color: '#000' }}>Login</Link>
                <Link 
                  to="/register"
                  style={{
                    textDecoration: 'none',
                    color: '#fff',
                    background: '#000',
                    padding: '0.25rem 0.75rem'
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
};

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:handle" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pages" element={<PagesListPage />} />
        <Route path="/pages/policies/:type" element={<PolicyPage />} />
        <Route path="/pages/:handle" element={<DynamicPage />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);

export default AppRouter;