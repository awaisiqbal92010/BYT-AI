import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cacheGet, cacheSet, cacheDelete, rateLimit } from "@/lib/cache";

export const dynamic = "force-dynamic";

// GET /api/projects - List only authenticated user's projects with caching
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client";
    const rl = await rateLimit(`projects_list_${ip}`, 120, 60);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (!user && hasSupabaseUrl && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")) {
      return NextResponse.json(
        { error: "Authentication required to view your private projects." },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json({ projects: [] });
    }

    // Check Redis cache first
    const cacheKey = `user_projects:${user.id}`;
    const cachedProjects = await cacheGet<any[]>(cacheKey);
    if (cachedProjects) {
      return NextResponse.json({ projects: cachedProjects, cached: true });
    }

    // Strictly fetch projects owned by current user (RLS also reinforces this)
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[Supabase GET /api/projects Error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = projects || [];
    // Cache for 300 seconds (5 minutes)
    await cacheSet(cacheKey, result, 300);

    return NextResponse.json({ projects: result });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects - Create or save project strictly tied to authenticated user's ID
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (!user && hasSupabaseUrl && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")) {
      return NextResponse.json(
        { error: "Authentication required to create or save projects." },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Anonymous saving is disabled. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, slug, framework, files, messages, description, preview_url, is_public } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const projectId = id || `proj-${Date.now()}`;
    const now = new Date().toISOString();

    const projectPayload = {
      id: projectId,
      user_id: user.id,
      name: name.trim(),
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      framework: framework || "Next.js 14",
      description: description || "AI generated web application project.",
      files: files || [],
      messages: messages || [],
      preview_url: preview_url || null,
      is_public: Boolean(is_public),
      updated_at: now,
    };

    const { data: savedProject, error } = await supabase
      .from("projects")
      .upsert(projectPayload)
      .select()
      .single();

    if (error) {
      console.error("[Supabase POST /api/projects Error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate user projects cache
    await cacheDelete(`user_projects:${user.id}`);
    await cacheDelete(`project:${projectId}`);

    return NextResponse.json({ success: true, project: savedProject });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
