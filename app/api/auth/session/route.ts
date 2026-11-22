import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, verifyIdToken } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

// POST /api/auth/session
// Accepts a Firebase ID token, verifies it, creates a session cookie,
// and upserts the user document in Firestore.
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: { code: "MISSING_TOKEN", message: "idToken is required." } }, { status: 400 });
    }

    const decoded = await verifyIdToken(idToken);
    if (!decoded) {
      return NextResponse.json({ error: { code: "INVALID_TOKEN", message: "Token verification failed." } }, { status: 401 });
    }

    // Create session cookie (7 days)
    const SESSION_DURATION_MS = 60 * 60 * 24 * 7 * 1000;
    let sessionCookie: string;
    try {
      sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn: SESSION_DURATION_MS });
    } catch (cookieErr) {
      // SECURITY: Do NOT fall back to storing the raw idToken as a session cookie.
      // A raw idToken is short-lived (~1h) but treating it as a session cookie
      // bypasses Firebase's revocation checks and createSessionCookie security.
      console.error("[Session] createSessionCookie failed:", cookieErr);
      return NextResponse.json(
        { error: { code: "SESSION_CREATION_FAILED", message: "Unable to create session. Ensure Firebase Admin is configured with a service account." } },
        { status: 500 }
      );
    }

    // Upsert user profile in Firestore
    try {
      const db = getAdminDb();
      const userRef = db.collection("users").doc(decoded.uid);
      const snap = await userRef.get();
      if (!snap.exists) {
        await userRef.set({
          uid: decoded.uid,
          email: decoded.email || "",
          displayName: decoded.name || decoded.email?.split("@")[0] || "User",
          photoURL: decoded.picture || null,
          plan: "free",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        await userRef.update({
          email: decoded.email || snap.data()?.email || "",
          displayName: decoded.name || snap.data()?.displayName || "User",
          photoURL: decoded.picture || snap.data()?.photoURL || null,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } catch (dbErr) {
      console.warn("[Session] Firestore user upsert warning:", dbErr);
    }

    const response = NextResponse.json({ success: true, uid: decoded.uid });
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS / 1000,
      path: "/",
    });
    return response;
  } catch (err: any) {
    console.error("[POST /api/auth/session]", err);
    return NextResponse.json({ error: { code: "SERVER_ERROR", message: err?.message || "Internal server error." } }, { status: 500 });
  }
}
