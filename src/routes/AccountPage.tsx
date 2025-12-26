import React from 'react';
import { useAuth } from '../context/AuthContext';

const AccountPage: React.FC = () => {
  const { customer, loading, error, initialized } = useAuth();

  if (!initialized || loading) {
    return <div>Loading account...</div>;
  }
  if (error) {
    return <div>Error loading account: {error}</div>;
  }
  if (!customer) {
    return <div>No customer session found.</div>;
  }

  return (
    <div>
      <h1>Account</h1>
      <p>
        Logged in as {customer.firstName} {customer.lastName} ({customer.email})
      </p>
      {/* Extend here to show addresses and orders from the full profile query */}
      <p>Order and address book UI can be added here based on profile data.</p>
    </div>
  );
};

export default AccountPage;