import { NextRequest, NextResponse } from "next/server";
import { generateEmbedConfig } from "@/lib/appetize";
import { verifySessionCookie } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/appetize/session
 *
 * Returns a signed Appetize embed configuration for the client.
 * Requires authentication — the embed URL uses the buildId which is
 * sufficient for Appetize's public embed to stream the device.
 *
 * Query params:
 *   - buildId (required): The Appetize build/public key
 *   - platform: "ios" | "android" (default: "android")
 *   - device: Device model string (default: auto-selected by platform)
 */
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Only trust server-verified session cookie — never client headers
    const cookie = request.cookies.get("session")?.value;
    const decodedSession = await verifySessionCookie(cookie);
    const uid = decodedSession?.uid ?? null;

    if (!uid) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Login required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const buildId = searchParams.get("buildId");
    const platform =
      (searchParams.get("platform") as "ios" | "android") || "android";
    const device = searchParams.get("device") || undefined;

    if (!buildId) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_BUILD_ID",
            message: "buildId query parameter is required",
          },
        },
        { status: 400 }
      );
    }

    const config = generateEmbedConfig({
      buildId,
      platform,
      device,
      scale: "auto",
      screenOnly: false,
      orientation: "portrait",
    });

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate session";
    console.error("[Appetize Session Error]:", message);
    return NextResponse.json(
      { error: { code: "SESSION_ERROR", message } },
      { status: 500 }
    );
  }
}
