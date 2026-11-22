import { Timestamp } from "firebase/firestore";

// ────────────────────────────────────────────────────────────────────────────
// Firestore Collection: users/{uid}
// ────────────────────────────────────────────────────────────────────────────
export interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  plan: "free" | "medium" | "premium" | "legendary";
  githubUsername?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ────────────────────────────────────────────────────────────────────────────
// Firestore Collection: projects/{projectId}
// ────────────────────────────────────────────────────────────────────────────
export interface FirestoreProject {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  framework: string;
  files: Array<{ path: string; content: string }>;
  messages: Array<{
    id: string;
    sender: "user" | "assistant" | "system";
    timestamp: string;
    content: string;
    files?: Array<{ name: string; action: string }>;
  }>;
  previewUrl?: string | null;
  isPublic: boolean;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// ────────────────────────────────────────────────────────────────────────────
// Firestore Collection: usage/{uid}/months/{YYYY-MM}
// ────────────────────────────────────────────────────────────────────────────
export interface FirestoreUsage {
  promptCount: number;
  updatedAt: Timestamp | string;
}

// Plan limits
export const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  medium: 200,
  premium: 1000,
  legendary: 99999,
};
