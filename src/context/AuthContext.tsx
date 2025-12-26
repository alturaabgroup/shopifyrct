import React, { createContext, useContext } from 'react';
import { useCustomerAuth } from '../hooks/useCustomerAuth';

type AuthContextValue = ReturnType<typeof useCustomerAuth>;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useCustomerAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}