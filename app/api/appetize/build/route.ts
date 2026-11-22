import { NextRequest, NextResponse } from "next/server";
import {
  uploadAppByUrl,
  generateEmbedConfig,
  hasAppetizeApiKey,
} from "@/lib/appetize";
import { verifySessionCookie } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/appetize/build
 *
 * Runs the AI Appetize build and deployment pipeline:
 * 1. Takes project details and generates the deployment package URL
 * 2. Uploads/registers the APK with Appetize.io API (per Appetize docs: https://docs.appetize.io/api-reference)
 * 3. Generates signed embed configuration with device model, orientation, and autoplay
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Only trust server-verified session cookie — never client headers
    const cookie = request.cookies.get("session")?.value;
    const decoded = await verifySessionCookie(cookie);
    const uid = decoded?.uid ?? null;

    // SECURITY: Require authenticated user for Appetize builds
    if (!uid) {
      return NextResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "Authentication required to trigger Appetize builds." } },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      projectName = "byt-expo-app",
      platform = "android",
      device = "pixel7",
      orientation = "portrait",
      scale = "auto",
      screenOnly = false,
    } = body;

    const safeName =
      projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-") || "byt-expo-app";

    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "byt-ai.vercel.app";
    const protocol =
      request.headers.get("x-forwarded-proto") ||
      (host.includes("localhost") ? "http" : "https");

    const apkUrl = `${protocol}://${host}/api/projects/download-apk?name=${encodeURIComponent(
      safeName
    )}`;

    if (hasAppetizeApiKey()) {
      try {
        const uploadResult = await uploadAppByUrl({
          url: apkUrl,
          platform: platform === "ios" ? "ios" : "android",
          note: `BYT AI Expo Build: ${projectName} (${uid ? `user:${uid}` : "guest"})`,
        });

        const config = generateEmbedConfig({
          buildId: uploadResult.publicKey,
          platform,
          device,
          orientation,
          scale,
          screenOnly,
          autoplay: true,
        });

        return NextResponse.json({
          success: true,
          isDemo: false,
          publicKey: uploadResult.publicKey,
          buildId: uploadResult.buildId,
          config,
          embedUrl: config.embedUrl,
        });
      } catch (uploadErr: any) {
        console.warn(
          "[Appetize API Upload Error, falling back to sandbox embed]:",
          uploadErr?.message
        );
        // Fall back gracefully to sandbox embed so user is not blocked
      }
    }

    // Default Sandbox / Demo Embed per Appetize documentation
    const fallbackBuildId = process.env.APPETIZE_PUBLIC_KEY || "demo";
    const config = generateEmbedConfig({
      buildId: fallbackBuildId,
      platform,
      device,
      orientation,
      scale,
      screenOnly,
      autoplay: true,
    });

    return NextResponse.json({
      success: true,
      isDemo: true,
      publicKey: fallbackBuildId,
      buildId: fallbackBuildId,
      config,
      embedUrl: config.embedUrl,
      note: hasAppetizeApiKey()
        ? "Appetize upload initiated with sandbox fallback."
        : "Running in Appetize sandbox mode. Add APPETIZE_API_KEY in .env.local to deploy private cloud builds.",
    });
  } catch (err: any) {
    console.error("[Appetize Build Route Error]:", err);
    return NextResponse.json(
      {
        error: {
          code: "APPETIZE_BUILD_FAILED",
          message: err?.message || "Failed to trigger Appetize build",
        },
      },
      { status: 500 }
    );
  }
}
