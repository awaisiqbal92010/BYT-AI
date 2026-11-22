import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cacheGet, cacheSet, cacheDelete } from "@/lib/cache";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id] - Fetch a specific project with strict ownership authorization and cache
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check Redis cache first
    const cacheKey = `project:${id}`;
    const cachedProject = await cacheGet<any>(cacheKey);
    if (cachedProject) {
      return NextResponse.json({ project: cachedProject, cached: true });
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch project
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    // Access control: only owner or public project can be viewed
    if (project.user_id !== user?.id && !project.is_public) {
      return NextResponse.json(
        {
          error: "Forbidden: This project is private and belongs to another account. You do not have permission to view it.",
        },
        { status: 403 }
      );
    }

    // Cache project for 300 seconds
    await cacheSet(cacheKey, project, 300);

    return NextResponse.json({ project });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update a specific project (must be owner)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // Verify ownership
    const { data: existing, error: findError } = await supabase
      .from("projects")
      .select("user_id")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify another user's project." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name) updatePayload.name = body.name.trim();
    if (body.slug) updatePayload.slug = body.slug;
    if (body.framework) updatePayload.framework = body.framework;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.files !== undefined) updatePayload.files = body.files;
    if (body.messages !== undefined) updatePayload.messages = body.messages;
    if (body.preview_url !== undefined) updatePayload.preview_url = body.preview_url;
    if (body.is_public !== undefined) updatePayload.is_public = Boolean(body.is_public);

    const { data: updated, error: updateError } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Invalidate project cache and user projects list cache
    await cacheDelete(`project:${id}`);
    await cacheDelete(`user_projects:${user.id}`);

    return NextResponse.json({ success: true, project: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete a project (must be owner)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Invalidate project cache and user projects list cache
    await cacheDelete(`project:${id}`);
    await cacheDelete(`user_projects:${user.id}`);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
