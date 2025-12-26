import React, { useState } from 'react';
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
    return <div className="flex items-center justify-center min-h-screen"><div className="text-gray-500">Loading...</div></div>;
  }
  if (!customer) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Header: React.FC = () => {
  const { customer, logout } = useAuth();
  const { cart } = useCart();
  const { shop } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const cartItemCount = cart?.lines.reduce((sum, line) => sum + line.quantity, 0) || 0;
  
  return (
    <>
      {/* Top Bar - Desktop Only */}
      <div className="hidden md:block bg-gray-900 text-white text-xs py-2">
        <div className="container-custom flex justify-between items-center">
          <div>Free Shipping on Orders Above ₹999</div>
          <div className="flex gap-4">
            <Link to="/pages" className="hover:text-gray-300">Help</Link>
            <Link to="/account" className="hover:text-gray-300">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              {shop?.brand?.logo?.image?.url ? (
                <img 
                  src={shop.brand.logo.image.url} 
                  alt={shop.name || 'Store'}
                  className="h-8 md:h-10 object-contain"
                />
              ) : (
                <span className="text-xl md:text-2xl font-display font-bold text-gray-900">
                  {shop?.name || 'SHOP'}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/collections" className="text-sm font-medium hover:text-primary-600 transition">Collections</Link>
              <Link to="/products" className="text-sm font-medium hover:text-primary-600 transition">All Products</Link>
              <Link to="/products?collection=corporate-uniforms" className="text-sm font-medium hover:text-primary-600 transition">Corporate</Link>
              <Link to="/products?collection=school-uniforms" className="text-sm font-medium hover:text-primary-600 transition">School Uniforms</Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Search - Desktop */}
              <button className="hidden md:block p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Account */}
              <Link to={customer ? "/account" : "/login"} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden border-t border-gray-200 p-3">
          <div className="relative">
            <input
              type="search"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 shadow-xl overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-display font-bold">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav className="space-y-4">
                <Link to="/" className="block py-2 text-lg font-medium hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/collections" className="block py-2 text-lg font-medium hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Collections</Link>
                <Link to="/products" className="block py-2 text-lg font-medium hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
                <Link to="/products?collection=corporate-uniforms" className="block py-2 text-lg font-medium hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Corporate Uniforms</Link>
                <Link to="/products?collection=school-uniforms" className="block py-2 text-lg font-medium hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>School Uniforms</Link>
                {customer ? (
                  <>
                    <Link to="/account" className="block py-2 text-lg font-medium hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block py-2 text-lg font-medium text-red-600 hover:text-red-700">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block py-2 text-lg font-medium hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                    <Link to="/register" className="block py-2 text-lg font-medium hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const Footer: React.FC = () => {
  const { shop, pages, policies } = useStore();
  const footerPages = pages.slice(0, 5);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-display font-semibold text-lg mb-4">{shop?.name || 'Shop'}</h3>
            <p className="text-sm text-gray-400 mb-4">{shop?.description || 'Quality uniforms and clothing for corporate and schools.'}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/collections" className="hover:text-white transition">Collections</Link></li>
              <li><Link to="/products" className="hover:text-white transition">All Products</Link></li>
              <li><Link to="/products?collection=corporate-uniforms" className="hover:text-white transition">Corporate</Link></li>
              <li><Link to="/products?collection=school-uniforms" className="hover:text-white transition">School</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-white font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm">
              {footerPages.slice(0, 4).map(page => (
                <li key={page.id}><Link to={`/pages/${page.handle}`} className="hover:text-white transition">{page.title}</Link></li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/account" className="hover:text-white transition">My Account</Link></li>
              <li><Link to="/pages/policies/shipping-policy" className="hover:text-white transition">Shipping Info</Link></li>
              <li><Link to="/pages/policies/refund-policy" className="hover:text-white transition">Returns</Link></li>
              <li><Link to="/pages" className="hover:text-white transition">Help Center</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {new Date().getFullYear()} {shop?.name || 'Shop'}. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            {policies.privacyPolicy && <Link to="/pages/policies/privacy-policy" className="hover:text-white transition">Privacy</Link>}
            {policies.termsOfService && <Link to="/pages/policies/terms-of-service" className="hover:text-white transition">Terms</Link>}
          </div>
        </div>
      </div>
    </footer>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
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
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);

export default AppRouter;
