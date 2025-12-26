import React, { useEffect } from 'react';
import AppRouter from './routes/Router';
import { NotificationManager } from './services/NotificationManager';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { initialized, customer } = useAuth();

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
          });
        }
      });
    }
  }, [initialized, customer]);

  return <AppRouter />;
};

export default App;