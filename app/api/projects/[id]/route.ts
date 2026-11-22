import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifySessionCookie } from "@/lib/firebase/admin";
import { cacheGet, cacheSet, cacheDelete } from "@/lib/cache";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams { params: Promise<{ id: string }> }

async function resolveUid(request: NextRequest): Promise<string | null> {
  const cookie = request.cookies.get("session")?.value;
  const decoded = await verifySessionCookie(cookie);
  return decoded?.uid ?? null;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cacheKey = "project:" + id;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) return NextResponse.json({ project: cached, cached: true });

    const uid = await resolveUid(request);
    const db = getAdminDb();
    const doc = await db.collection("projects").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const data = doc.data()!;
    if (data.userId !== uid && !data.isPublic) {
      return NextResponse.json({ error: "Forbidden: this project is private." }, { status: 403 });
    }

    const project = { id: doc.id, ...data };
    await cacheSet(cacheKey, project, 300);
    return NextResponse.json({ project });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const uid = await resolveUid(request);
    if (!uid) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const db = getAdminDb();
    const ref = db.collection("projects").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    if (existing.data()?.userId !== uid) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const body = await request.json();
    const update: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
    if (body.name) update.name = body.name.trim();
    if (body.slug) update.slug = body.slug;
    if (body.framework) update.framework = body.framework;
    if (body.description !== undefined) update.description = body.description;
    if (body.files !== undefined) update.files = body.files;
    if (body.messages !== undefined) update.messages = body.messages;
    if (body.preview_url !== undefined) update.previewUrl = body.preview_url;
    if (body.is_public !== undefined) update.isPublic = Boolean(body.is_public);

    await ref.update(update);
    await cacheDelete("project:" + id);
    await cacheDelete("user_projects:" + uid);
    return NextResponse.json({ success: true, project: { id, ...update } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const uid = await resolveUid(request);
    if (!uid) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const db = getAdminDb();
    const ref = db.collection("projects").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    if (existing.data()?.userId !== uid) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    await ref.delete();
    await cacheDelete("project:" + id);
    await cacheDelete("user_projects:" + uid);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}