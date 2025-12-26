import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCustomerAuth } from '../hooks/useCustomerAuth';

// Example: abstract shopifyFetch (if you rewire hook to import from services)
vi.mock('../services/shopifyClient', () => ({
  shopifyFetch: vi.fn()
}));

describe('useCustomerAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('renews a near-expiry token on init', async () => {
    const now = Date.now();
    const expiresSoon = new Date(now + 1_000 * 60 * 10).toISOString(); // 10m
    const stored = {
      token: { accessToken: 'old-token', expiresAt: expiresSoon }
    };
    window.localStorage.setItem('shopify_customer_access_token_v1', JSON.stringify(stored));

    const { shopifyFetch } = await import('../services/shopifyClient');
    (shopifyFetch as any)
      .mockResolvedValueOnce({
        customerAccessTokenRenew: {
          customerAccessToken: {
            accessToken: 'new-token',
            expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 10).toISOString() // +10 days
          },
          userErrors: []
        }
      })
      .mockResolvedValueOnce({
        customer: {
          id: 'gid://shopify/Customer/1',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        }
      });

    const { result } = renderHook(() => useCustomerAuth());

    // Wait a tick for init; in real test you'd use waitFor from RTL
    await act(async () => {
      await new Promise((res) => setTimeout(res, 0));
    });

    expect(result.current.token?.accessToken).toBe('new-token');
    expect(result.current.customer?.email).toBe('test@example.com');
  });
});