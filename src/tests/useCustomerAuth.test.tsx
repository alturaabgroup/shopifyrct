import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCustomerAuth } from '../hooks/useCustomerAuth';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('useCustomerAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mockFetch.mockClear();
  });

  it('initializes with null customer when API returns null', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: null })
    });

    const { result } = renderHook(() => useCustomerAuth());

    await waitFor(() => {
      expect(result.current.initialized).toBe(true);
    });

    expect(result.current.customer).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/me',
      expect.objectContaining({
        credentials: 'include'
      })
    );
  });

  it('initializes with customer data when logged in', async () => {
    const mockCustomer = {
      id: 'gid://shopify/Customer/1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: mockCustomer })
    });

    const { result } = renderHook(() => useCustomerAuth());

    await waitFor(() => {
      expect(result.current.initialized).toBe(true);
    });

    expect(result.current.customer).toEqual(mockCustomer);
    expect(result.current.loading).toBe(false);
  });

  it('handles login successfully', async () => {
    // Initial auth check
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: null })
    });

    const { result } = renderHook(() => useCustomerAuth());

    await waitFor(() => {
      expect(result.current.initialized).toBe(true);
    });

    // Login request
    const mockCustomer = {
      id: 'gid://shopify/Customer/1',
      email: 'test@example.com',
      firstName: 'Test'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: mockCustomer })
    });

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    expect(result.current.customer).toEqual(mockCustomer);
    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    );
  });

  it('handles logout', async () => {
    const mockCustomer = {
      id: 'gid://shopify/Customer/1',
      email: 'test@example.com'
    };

    // Initial auth check with logged in customer
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: mockCustomer })
    });

    const { result } = renderHook(() => useCustomerAuth());

    await waitFor(() => {
      expect(result.current.customer).toEqual(mockCustomer);
    });

    // Logout request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.customer).toBeNull();
    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include'
      })
    );
  });
});