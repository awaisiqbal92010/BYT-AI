"use client";

import * as React from "react";
import {
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { generateProjectId } from "@/lib/project-storage";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithGithub: () => Promise<{ error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function persistSession(user: User): Promise<void> {
  try {
    const idToken = await user.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } catch (e) {
    console.warn("[Auth] Failed to persist session cookie:", e);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await persistSession(firebaseUser);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  function getPostAuthDestination(): string {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");
        if (next && next.startsWith("/") && !next.startsWith("//")) {
          return next;
        }
        const pendingRaw = sessionStorage.getItem("byt_pending_build");
        if (pendingRaw) {
          const pending = JSON.parse(pendingRaw);
          if (pending?.prompt) {
            const id = pending.projectId || pending.newId || generateProjectId();
            return `/apps/${id}/editor/preview`;
          }
        }
      } catch (err) {
        console.warn("[Auth] Failed to parse post-auth destination:", err);
      }
    }
    return "/dashboard";
  }

  async function signInWithGoogle() {
    try {
      const auth = getClientAuth();
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");
      const result = await signInWithPopup(auth, provider);
      await persistSession(result.user);
      router.push(getPostAuthDestination());
      return { error: null };
    } catch (e: any) {
      return { error: e?.message || "Google sign-in failed." };
    }
  }

  async function signInWithGithub() {
    try {
      const auth = getClientAuth();
      const provider = new GithubAuthProvider();
      provider.addScope("user:email");
      const result = await signInWithPopup(auth, provider);
      await persistSession(result.user);
      router.push(getPostAuthDestination());
      return { error: null };
    } catch (e: any) {
      return { error: e?.message || "GitHub sign-in failed." };
    }
  }

  async function signInWithEmail(email: string, password: string) {
    try {
      const auth = getClientAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      await persistSession(result.user);
      router.push(getPostAuthDestination());
      return { error: null };
    } catch (e: any) {
      return { error: e?.message || "Sign-in failed. Check your credentials." };
    }
  }

  async function signUpWithEmail(email: string, password: string, displayName: string) {
    try {
      const auth = getClientAuth();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await persistSession(result.user);
      router.push(getPostAuthDestination());
      return { error: null };
    } catch (e: any) {
      return { error: e?.message || "Account creation failed." };
    }
  }

  async function logout() {
    try {
      const auth = getClientAuth();
      await signOut(auth);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      console.error("[Auth] Logout error:", e);
    }
  }

  async function resetPassword(email: string) {
    try {
      const auth = getClientAuth();
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (e: any) {
      return { error: e?.message || "Password reset failed." };
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
