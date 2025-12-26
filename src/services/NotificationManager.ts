import { getFirebaseMessaging } from '../firebase/firebase-config';
import { getToken, onMessage } from 'firebase/messaging';
import { useAuth } from '../context/AuthContext'; // when used in a component

// ...

  private static async sendTokenToServer(token: string, email?: string | null): Promise<void> {
    await fetch('/api/push/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, email })
    });
  }