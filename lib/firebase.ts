import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyMockKeyForDevelopment",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "byt-ai-builder.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "byt-ai-builder",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "byt-ai-builder.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-BYTENGINE2026",
};

// Initialize Firebase App (singleton)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google OAuth Sign In
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;
    return { user, token, error: null };
  } catch (error: any) {
    return { user: null, token: null, error: error.message };
  }
}

// Sign out
export async function firebaseSignOut() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Google Analytics event logger
export async function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window !== "undefined") {
    try {
      const supported = await isSupported();
      if (supported) {
        const analytics = getAnalytics(app);
        logEvent(analytics, eventName, eventParams);
      }
    } catch (e) {
      console.debug("[Analytics Event]:", eventName, eventParams);
    }
  }
}
