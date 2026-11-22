import { NextRequest, NextResponse } from "next/server";
import { pauseSandbox } from "@/lib/sandbox";

export const dynamic = "force-dynamic";

/**
 * Pause sandbox by ID to preserve memory and files without running compute costs
 * Official E2B guide: https://docs.e2b.dev/sandbox/persistence
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sandboxId = body?.sandboxId;

    if (!sandboxId || typeof sandboxId !== "string") {
      return NextResponse.json(
        { success: false, error: "sandboxId is required." },
        { status: 400 }
      );
    }

    const paused = await pauseSandbox(sandboxId.trim());

    return NextResponse.json({
      success: paused,
      sandboxId,
      message: paused
        ? `Sandbox ${sandboxId} paused. State preserved indefinitely in E2B cloud.`
        : `Sandbox ${sandboxId} was not in active memory or could not be paused.`,
    });
  } catch (error: any) {
    console.error("[Sandbox Pause API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to pause sandbox.",
      },
      { status: 500 }
    );
  }
}
