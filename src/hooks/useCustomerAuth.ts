// ...existing imports & state...

type RegisterInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

// ...

export function useCustomerAuth() {
  // ...state & helpers...

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
    [setCustomer, setError, setLoading]
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
        // Backend already logs in and sets cookie, so we just sync customer state.
        setCustomer(data.customer);
        setLoading(false);
      } catch (err: any) {
        console.error('Register error', err);
        setError(err?.message ?? 'Registration failed');
        setLoading(false);
        throw err;
      }
    },
    [setCustomer, setError, setLoading]
  );

  // ...logout, refreshProfile, init useEffect, return value...
}