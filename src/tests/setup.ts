import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
import.meta.env.VITE_SHOPIFY_STORE_DOMAIN = 'test-store.myshopify.com';
import.meta.env.VITE_SHOPIFY_STOREFRONT_API_TOKEN = 'test-token';
import.meta.env.VITE_FIREBASE_VAPID_KEY = 'test-vapid-key';
