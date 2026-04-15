/**
 * Firebase Client Service
 * 
 * Initializes the Firebase Web SDK for the frontend.
 * Provides authentication and Firestore database instances.
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Initiates a Google Sign-In popup.
 */
export const signIn = () => signInWithPopup(auth, googleProvider);

/**
 * Signs out the current user.
 */
export const signOut = () => auth.signOut();

/**
 * Verifies the Firestore connection on startup.
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("[Firebase] Connection Error: The client is offline. Check configuration.");
    }
  }
}
testConnection();
