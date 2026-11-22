import { NextRequest, NextResponse } from "next/server";
import { runCommandInSandbox } from "@/lib/sandbox";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Block dangerous commands to prevent remote code execution or sandbox breakout
const FORBIDDEN_COMMAND_PATTERNS = [
  /rm\s+-rf\s+\/(?:\s|$)/i,
  /rm\s+-rf\s+\/\*/i,
  /:()\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/, // Fork bomb
  /mkfs/i,
  /dd\s+if=/i,
  /169\.254\.169\.254/, // Cloud metadata IP
  /\/etc\/shadow/i,
  /\/etc\/passwd/i,
  /curl\s+.*\|\s*(?:bash|sh)/i,
  /wget\s+.*\|\s*(?:bash|sh)/i,
  /chmod\s+777\s+\//i,
];

export async function POST(request: NextRequest) {
  try {
    // Authenticate optionally; guests can use isolated sandbox terminal freely
    const supabase = createClient();
    try {
      await supabase.auth.getUser();
    } catch {}

    const body = await request.json();
    const command = body?.command;
    const sandboxId = body?.sandboxId;

    if (!command || typeof command !== "string" || !command.trim()) {
      return NextResponse.json(
        { success: false, error: "Command string is required." },
        { status: 400 }
      );
    }

    const trimmedCommand = command.trim();

    // 2. Vulnerability check: sanitize command against dangerous patterns
    for (const pattern of FORBIDDEN_COMMAND_PATTERNS) {
      if (pattern.test(trimmedCommand)) {
        return NextResponse.json(
          {
            success: false,
            error: "Execution blocked: Command contains forbidden or hazardous system operations.",
          },
          { status: 403 }
        );
      }
    }

    // 3. Execute command inside isolated microVM sandbox
    const result = await runCommandInSandbox(sandboxId, trimmedCommand);

    return NextResponse.json({
      success: true,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    });
  } catch (error: any) {
    console.error("[Sandbox Terminal Command Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to execute command in sandbox.",
      },
      { status: 500 }
    );
  }
}
