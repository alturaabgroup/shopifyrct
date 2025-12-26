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
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

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

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { customer, logout } = useAuth();
  const { cart } = useCart();
  
  const cartItemCount = cart?.lines.reduce((sum, line) => sum + line.quantity, 0) || 0;
  
  return (
    <div>
      <header style={{ padding: '1rem', borderBottom: '1px solid #ddd', background: '#f8f8f8' }}>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', color: '#000' }}>
            Shop
          </Link>
          <Link to="/collections" style={{ textDecoration: 'none', color: '#000' }}>Collections</Link>
          <Link to="/products" style={{ textDecoration: 'none', color: '#000' }}>All Products</Link>
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
      <main>{children}</main>
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