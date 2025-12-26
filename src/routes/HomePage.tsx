import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the Shopify Headless PWA</h1>
      <p>This is a React-based PWA powered by Shopify Storefront API 2025-10.</p>
      <Link to="/products">Browse products</Link>
    </div>
  );
};

export default HomePage;