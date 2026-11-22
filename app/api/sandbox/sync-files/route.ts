import { NextRequest, NextResponse } from "next/server";
import { syncFilesToActiveSandbox, SandboxFile } from "@/lib/sandbox";
import { verifySessionCookie } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authenticated user
    const cookie = request.cookies.get("session")?.value;
    const decoded = await verifySessionCookie(cookie);
    if (!decoded?.uid) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const sandboxId = body?.sandboxId;
    const files: SandboxFile[] = body?.files;

    if (!sandboxId || typeof sandboxId !== "string") {
      return NextResponse.json(
        { success: false, error: "sandboxId is required." },
        { status: 400 }
      );
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "files array is required." },
        { status: 400 }
      );
    }

    const result = await syncFilesToActiveSandbox(sandboxId, files);

    return NextResponse.json({
      success: result.success,
      updatedCount: result.updatedCount,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("[Sandbox Sync Files Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to sync files to sandbox microVM.",
      },
      { status: 500 }
    );
  }
}
