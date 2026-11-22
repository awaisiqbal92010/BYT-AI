import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifySessionCookie } from "@/lib/firebase/admin";
import { cacheGet, cacheSet, cacheDelete, rateLimit } from "@/lib/cache";
import { FieldValue } from "firebase-admin/firestore";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function resolveAuthenticatedUid(request: NextRequest): Promise<string | null> {
  const cookie = request.cookies.get("session")?.value;
  const decoded = await verifySessionCookie(cookie);
  return decoded?.uid ?? null;
}

// GET /api/projects — list authenticated user's projects
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client";
    const rl = await rateLimit(`projects_list_${ip}`, 120, 60);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const uid = await resolveAuthenticatedUid(request);
    if (!uid) {
      return NextResponse.json({ projects: [] });
    }

    const cacheKey = `user_projects:${uid}`;
    const cached = await cacheGet<any[]>(cacheKey);
    if (cached) return NextResponse.json({ projects: cached, cached: true });

    const db = getAdminDb();
    const snap = await db
      .collection("projects")
      .where("userId", "==", uid)
      .orderBy("updatedAt", "desc")
      .get();

    const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    await cacheSet(cacheKey, projects, 300);
    return NextResponse.json({ projects });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects — create or upsert project
export async function POST(request: NextRequest) {
  try {
    const uid = await resolveAuthenticatedUid(request);
    if (!uid) {
      return NextResponse.json({ error: "Authentication required to save projects." }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, framework, files, messages, description, preview_url, is_public } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    }

    const projectId = id || randomBytes(12).toString("hex");
    const now = FieldValue.serverTimestamp();

    const db = getAdminDb();
    const ref = db.collection("projects").doc(projectId);
    const existing = await ref.get();

    // Ownership check on update
    if (existing.exists && existing.data()?.userId !== uid) {
      return NextResponse.json({ error: "Forbidden: you cannot modify another user's project." }, { status: 403 });
    }

    const payload: Record<string, any> = {
      userId: uid,
      name: name.trim(),
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      framework: framework || "Next.js 14",
      description: description || "AI generated web application project.",
      files: files || [],
      messages: messages || [],
      previewUrl: preview_url || null,
      isPublic: Boolean(is_public),
      updatedAt: now,
    };

    if (!existing.exists) {
      payload.createdAt = now;
    }

    await ref.set(payload, { merge: true });

    await cacheDelete(`user_projects:${uid}`);
    await cacheDelete(`project:${projectId}`);

    return NextResponse.json({ success: true, project: { id: projectId, ...payload } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
