import { NextRequest, NextResponse } from "next/server";
import { reconnectToSandbox, SandboxFramework } from "@/lib/sandbox";
import { verifySessionCookie } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * Connect to running/paused sandbox by ID
 * Official E2B guide: https://docs.e2b.dev/sandbox/connect
 */
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
    const framework: SandboxFramework = body?.framework || "vite-react";

    if (!sandboxId || typeof sandboxId !== "string") {
      return NextResponse.json(
        { success: false, error: "sandboxId is required and must be a string." },
        { status: 400 }
      );
    }

    const { sandboxId: connectedId, previewUrl } = await reconnectToSandbox(
      sandboxId.trim(),
      framework
    );

    return NextResponse.json({
      success: true,
      sandboxId: connectedId,
      previewUrl,
      framework,
      message: `Successfully connected to E2B sandbox ${connectedId}`,
    });
  } catch (error: any) {
    console.error("[Sandbox Connect API Error]:", error);
    const isApiKeyMissing = !process.env.E2B_API_KEY;

    return NextResponse.json(
      {
        success: false,
        error: isApiKeyMissing
          ? "E2B_API_KEY is not configured in .env.local. Please add your E2B API key."
          : error?.message || "Failed to connect to sandbox instance.",
      },
      { status: 500 }
    );
  }
}
