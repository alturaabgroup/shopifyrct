import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string
};

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes('your_') && 
  firebaseConfig.projectId && 
  !firebaseConfig.projectId.includes('your-');

let firebaseApp: FirebaseApp | null = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase is not configured. Push notifications will be disabled.');
}

let messagingInstance: Messaging | null = null;

export function getFirebaseMessaging(): Messaging | null {
  if (!firebaseApp) {
    return null;
  }
  
  if (!('Notification' in window)) {
    console.warn('Notifications are not supported in this browser.');
    return null;
  }
  
  if (!messagingInstance) {
    try {
      messagingInstance = getMessaging(firebaseApp);
    } catch (error) {
      console.warn('Failed to initialize Firebase Messaging:', error);
      return null;
    }
  }
  
  return messagingInstance;
}