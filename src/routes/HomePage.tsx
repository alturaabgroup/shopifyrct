import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Welcome to Our Store
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '2rem' }}>
          Discover our curated collections and find exactly what you're looking for
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            to="/collections"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: '#000',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '1.1rem',
              borderRadius: '4px'
            }}
          >
            Browse Collections
          </Link>
          <Link
            to="/products"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: '#fff',
              color: '#000',
              textDecoration: 'none',
              fontSize: '1.1rem',
              border: '2px solid #000',
              borderRadius: '4px'
            }}
          >
            View All Products
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '4rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Why Shop With Us?</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}
        >
          <div style={{ padding: '1.5rem', background: '#f8f8f8', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>🚚 Fast Shipping</h3>
            <p style={{ color: '#666' }}>
              Quick and reliable delivery to your doorstep
            </p>
          </div>
          <div style={{ padding: '1.5rem', background: '#f8f8f8', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>✨ Quality Products</h3>
            <p style={{ color: '#666' }}>
              Carefully curated selection of premium items
            </p>
          </div>
          <div style={{ padding: '1.5rem', background: '#f8f8f8', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>🔒 Secure Checkout</h3>
            <p style={{ color: '#666' }}>
              Safe and secure payment processing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;