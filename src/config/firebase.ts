import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Initialize with development credentials if env vars are not set
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDevelopmentKeyForTesting",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Initialize with mock implementations for development
  auth = {
    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {};
    },
    currentUser: null
  } as unknown as Auth;
  
  db = {
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: () => false,
          data: () => ({})
        })
      })
    })
  } as unknown as Firestore;
}

export { db, auth };