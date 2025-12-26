import { getFirebaseMessaging } from '../firebase/firebase-config';
import { getToken, onMessage } from 'firebase/messaging';

export class NotificationManager {
  private static async sendTokenToServer(token: string, email?: string | null): Promise<void> {
    await fetch('/api/push/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, email })
    });
  }

  static async requestPermissionAndGetToken(email?: string | null): Promise<string | null> {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });
        if (token) {
          await this.sendTokenToServer(token, email);
          return token;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting notification token:', error);
      return null;
    }
  }

  static async setupMessageListener(callback: (payload: any) => void): Promise<void> {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      callback(payload);
    });
  }
}
  }