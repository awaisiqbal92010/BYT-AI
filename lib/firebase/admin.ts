import { App, getApp, getApps, initializeApp, cert } from "firebase-admin/app";
import { Auth, getAuth, DecodedIdToken } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";

let _adminApp: App | undefined;

/**
 * Returns the Firebase Admin SDK app singleton.
 * Uses service account credentials when available, otherwise falls back to
 * project-only initialisation (works with ADC / emulators).
 */
export function getAdminApp(): App {
  if (_adminApp) return _adminApp;
  if (getApps().length > 0) {
    _adminApp = getApp();
    return _adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "byt----build-your-thoughts";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    _adminApp = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
  } else {
    // Fallback: works in local dev without service account (limited functionality)
    _adminApp = initializeApp({ projectId });
  }

  return _adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

interface CachedSession {
  token: DecodedIdToken;
  expiresAt: number;
}

// High-throughput LRU-like session verification cache (60s TTL)
// Eliminates repetitive Firebase Auth RPC calls under heavy concurrency (1M scale)
const _sessionCache = new Map<string, CachedSession>();
const SESSION_CACHE_TTL_MS = 60 * 1000;
const MAX_CACHE_SIZE = 10_000;

/**
 * Verifies the Firebase session cookie and returns the decoded token,
 * or null if the cookie is invalid / missing.
 * Cached in-memory for 60 seconds to scale to high concurrent load.
 */
export async function verifySessionCookie(
  sessionCookie: string | undefined
): Promise<DecodedIdToken | null> {
  if (!sessionCookie) return null;

  // 1. Fast in-memory cache check
  const cached = _sessionCache.get(sessionCookie);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }

  // 2. Cryptographic verification via Firebase Admin SDK
  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);

    if (decoded) {
      if (_sessionCache.size >= MAX_CACHE_SIZE) {
        // Prune oldest 20% entries if cache max exceeded
        const keysToDelete = Array.from(_sessionCache.keys()).slice(0, 2000);
        keysToDelete.forEach((k) => _sessionCache.delete(k));
      }
      _sessionCache.set(sessionCookie, {
        token: decoded,
        expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
      });
    }

    return decoded;
  } catch {
    _sessionCache.delete(sessionCookie);
    return null;
  }
}

/**
 * Verifies a Firebase ID token (used during session creation).
 */
export async function verifyIdToken(
  idToken: string
): Promise<DecodedIdToken | null> {
  try {
    return await getAdminAuth().verifyIdToken(idToken);
  } catch {
    return null;
  }
}
