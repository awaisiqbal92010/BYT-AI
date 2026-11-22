import * as React from "react";
import { cookies } from "next/headers";
import { Navbar, UserData } from "@/components/Navbar";
import { getAdminDb, verifySessionCookie } from "@/lib/firebase/admin";
import { FirestoreUser } from "@/lib/firebase/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SECURITY: Only trust server-verified session cookie — never client-supplied headers
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const decoded = await verifySessionCookie(sessionCookie);
  const uid: string | null = decoded?.uid ?? null;

  let profile: FirestoreUser | null = null;

  if (uid) {
    try {
      const db = getAdminDb();
      const userDoc = await db.collection("users").doc(uid).get();
      if (userDoc.exists) {
        profile = userDoc.data() as FirestoreUser;
      }
    } catch {
      // Graceful fallback for local development or disconnected state
    }
  }

  const userData: UserData = {
    id: uid || "local-user",
    email: profile?.email || "developer@byt.site",
    github_username:
      profile?.displayName ||
      profile?.githubUsername ||
      profile?.email?.split("@")[0] ||
      "Muhammad Iqbal",
    avatar_url: profile?.photoURL || undefined,
    plan: profile?.plan || "free",
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top Navigation Bar with Real Firebase User Data */}
      <Navbar user={userData} />

      {/* Main Workspace Area */}
      <main className="relative flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
