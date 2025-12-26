import React, { useEffect } from 'react';
import AppRouter from './routes/Router';
import { NotificationManager } from './services/NotificationManager';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { initialized, customer } = useAuth();

  useEffect(() => {
    console.log('App mounted - Auth initialized:', initialized, 'Customer:', customer);
  }, [initialized, customer]);

  useEffect(() => {
    if (initialized && customer) {
      NotificationManager.initFCM().then(async (token) => {
        if (token) {
          // Optionally ensure server knows this token belongs to this customer
          await fetch('/api/push/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token, email: customer.email })
          }).catch(err => console.warn('Push registration failed:', err));
        }
      });
    }
  }, [initialized, customer]);

  if (!initialized) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading application...</h2>
        <p>Initializing authentication...</p>
      </div>
    );
  }

  return <AppRouter />;
};

export default App;