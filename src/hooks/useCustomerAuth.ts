import { useState, useEffect, useCallback } from 'react';

type Customer = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

async function apiFetch<T>(url: string, options?: { method?: string; json?: any }): Promise<T> {
  const res = await fetch(url, {
    method: options?.method || 'GET',
    headers: options?.json ? { 'Content-Type': 'application/json' } : {},
    credentials: 'include',
    body: options?.json ? JSON.stringify(options.json) : undefined
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export function useCustomerAuth() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async ({ email, password }: LoginInput) => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{ customer: Customer }>('/api/auth/login', {
          method: 'POST',
          json: { email, password }
        });
        setCustomer(data.customer);
        setLoading(false);
      } catch (err: any) {
        console.error('Login error', err);
        setError(err?.message ?? 'Login failed');
        setCustomer(null);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  const register = useCallback(
    async ({ email, password, firstName, lastName }: RegisterInput) => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{ customer: Customer }>('/api/auth/register', {
          method: 'POST',
          json: { email, password, firstName, lastName }
        });
        setCustomer(data.customer);
        setLoading(false);
      } catch (err: any) {
        console.error('Register error', err);
        setError(err?.message ?? 'Registration failed');
        setLoading(false);
        throw err;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setCustomer(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await apiFetch<{ customer: Customer | null }>('/api/auth/me');
      setCustomer(data.customer);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setCustomer(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Try to fetch current session, but don't block if API isn't available
    apiFetch<{ customer: Customer | null }>('/api/auth/me')
      .then((data) => {
        if (mounted) {
          setCustomer(data.customer);
          setLoading(false);
          setInitialized(true);
        }
      })
      .catch((err) => {
        // API might not be running - this is OK for frontend-only demo
        console.warn('Auth API not available:', err.message);
        if (mounted) {
          setCustomer(null);
          setLoading(false);
          setInitialized(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    customer,
    loading,
    initialized,
    error,
    login,
    register,
    logout,
    refreshProfile
  };
}