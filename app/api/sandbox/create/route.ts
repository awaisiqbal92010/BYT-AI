import { NextRequest, NextResponse } from "next/server";
import { createSandboxWithFiles, SandboxFile, SandboxFramework, detectFrameworkFromFiles } from "@/lib/sandbox";
import { rateLimit } from "@/lib/cache";
import { verifySessionCookie } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const rl = await rateLimit(`sandbox_create_${ip}`, 10, 60);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: "Sandbox creation rate limit reached. Please wait before creating another." },
        { status: 429 }
      );
    }

    const cookie = request.cookies.get("session")?.value;
    const decoded = await verifySessionCookie(cookie);
    const uid = decoded?.uid ?? null;

    // SECURITY: Require authenticated user for sandbox creation
    if (!uid) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Authentication required to create sandboxes." } },
        { status: 401 }
      );
    }

    let customFiles: SandboxFile[] | undefined = undefined;
    let framework: SandboxFramework = "vite-react";
    let requestedSandboxId: string | undefined = undefined;

    try {
      const body = await request.json();
      if (body?.sandboxId && typeof body.sandboxId === "string") {
        requestedSandboxId = body.sandboxId;
      }
      if (body?.files && Array.isArray(body.files) && body.files.length > 0) {
        customFiles = body.files;
      }
      if (body?.framework && ["vite-react", "nextjs", "react-native-expo"].includes(body.framework)) {
        framework = body.framework;
      } else if (customFiles) {
        framework = detectFrameworkFromFiles(customFiles);
      }
    } catch {
      // Body is empty or not JSON — use default test files
    }

    const { sandboxId, previewUrl } = await createSandboxWithFiles(
      customFiles,
      framework,
      requestedSandboxId
    );

    return NextResponse.json({
      success: true,
      sandboxId,
      previewUrl,
      framework,
      reused: Boolean(requestedSandboxId && requestedSandboxId === sandboxId),
    });
  } catch (error: any) {
    console.error("[Sandbox API Error]:", error);

    const errorMessage = error?.message || "Failed to create E2B sandbox instance.";
    const isApiKeyMissing = !process.env.E2B_API_KEY;

    return NextResponse.json(
      {
        success: false,
        error: isApiKeyMissing
          ? "E2B_API_KEY is not configured in .env.local. Please add your E2B API key."
          : errorMessage,
      },
      { status: 500 }
    );
  }
}
