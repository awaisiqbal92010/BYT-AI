import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, verifySessionCookie } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function resolveUid(request: NextRequest): Promise<string | null> {
  const cookie = request.cookies.get("session")?.value;
  const decoded = await verifySessionCookie(cookie);
  return decoded?.uid ?? null;
}

// GET /api/user — fetch authenticated user profile
export async function GET(request: NextRequest) {
  try {
    const uid = await resolveUid(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const db = getAdminDb();
    const doc = await db.collection("users").doc(uid).get();

    if (!doc.exists) {
      // Fallback from auth
      const authUser = await getAdminAuth().getUser(uid).catch(() => null);
      return NextResponse.json({
        user: {
          uid,
          email: authUser?.email || "",
          displayName: authUser?.displayName || "User",
          photoURL: authUser?.photoURL || null,
          plan: "free",
        },
      });
    }

    return NextResponse.json({ user: { uid, ...doc.data() } });
  } catch (err: any) {
    console.error("[GET /api/user]", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/user — update user profile (displayName, photoURL, githubUsername, plan)
export async function PATCH(request: NextRequest) {
  try {
    const uid = await resolveUid(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = await request.json();
    const update: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (body.displayName !== undefined) update.displayName = String(body.displayName).trim();
    if (body.photoURL !== undefined) update.photoURL = body.photoURL;
    if (body.githubUsername !== undefined) update.githubUsername = String(body.githubUsername).trim();
    // Security: 'plan' upgrades are restricted to verified billing webhooks only

    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    await userRef.set(update, { merge: true });

    // Also sync displayName or photoURL to Firebase Auth if provided
    if (body.displayName || body.photoURL) {
      try {
        await getAdminAuth().updateUser(uid, {
          ...(body.displayName ? { displayName: update.displayName } : {}),
          ...(body.photoURL ? { photoURL: update.photoURL } : {}),
        });
      } catch (authErr) {
        console.warn("[PATCH /api/user] Auth profile sync warning:", authErr);
      }
    }

    const updatedDoc = await userRef.get();
    return NextResponse.json({ success: true, user: { uid, ...updatedDoc.data() } });
  } catch (err: any) {
    console.error("[PATCH /api/user]", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/user — delete user account and their projects
export async function DELETE(request: NextRequest) {
  try {
    const uid = await resolveUid(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const db = getAdminDb();

    // Delete user's projects
    const projectsSnap = await db.collection("projects").where("userId", "==", uid).get();
    const batch = db.batch();
    projectsSnap.docs.forEach((doc) => batch.delete(doc.ref));

    // Delete user document
    batch.delete(db.collection("users").doc(uid));
    await batch.commit();

    // Delete from Firebase Auth
    await getAdminAuth().deleteUser(uid).catch(() => null);

    const response = NextResponse.json({ success: true, message: "Account deleted." });
    response.cookies.delete("session");
    return response;
  } catch (err: any) {
    console.error("[DELETE /api/user]", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
