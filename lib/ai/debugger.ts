import { callMistral, callOpenRouter, Message, ProviderError } from "./providers";
import { BuildPlan, ProjectFile } from "./orchestrator";

export interface FileFix {
  path: string;
  content: string;
}

export interface DebuggerResult {
  fixes: FileFix[];
}

const DEBUGGER_SYSTEM_PROMPT = `You are a World-Class Senior Debugging and Build-Fixing Engineer.
You will be given the FULL list of project files (paths + contents) and a raw build / compilation error log from a Vite + React + Tailwind CSS project.

YOUR GOAL:
Analyze the error stack trace, diagnose the root cause (such as missing imports, bad syntax, incorrect exports, circular dependencies, or misnamed components), and return ONLY the repaired/fixed file(s).

STRICT OUTPUT FORMAT:
Return a valid JSON object matching this exact schema:
{
  "fixes": [
    {
      "path": "src/components/BrokenComponent.jsx",
      "content": "...complete corrected raw file content..."
    }
  ]
}

CRITICAL RULES:
1. Return VALID JSON ONLY. Zero markdown code fences (no \`\`\`json), zero conversational text.
2. In each fix, provide the ENTIRE corrected file content, not diffs or partial snippets.
3. Only return files that actually need modifications to resolve the build error.
4. Ensure all import paths match existing files and exported component names.
5. If vite.config.js is modified, ensure server.allowedHosts is set to true.`;

/**
 * Attempts to parse the debugger LLM response into a DebuggerResult.
 */
function parseDebuggerOutput(rawOutput: string): DebuggerResult {
  let cleaned = rawOutput.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    const firstNewline = cleaned.indexOf("\n");
    if (firstNewline !== -1) {
      cleaned = cleaned.substring(firstNewline + 1);
    } else {
      cleaned = cleaned.replace(/^```[a-zA-Z0-9_-]*\s*/, "");
    }
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.lastIndexOf("```")).trimEnd();
  }

  // Attempt standard JSON parsing
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed.fixes)) {
      return {
        fixes: parsed.fixes.map((f: any) => ({
          path: String(f.path || ""),
          content: String(f.content || ""),
        })),
      };
    }
  } catch {
    // Attempt regex extraction for { "fixes": [ ... ] }
    const match = cleaned.match(/\{[\s\S]*"fixes"[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed.fixes)) {
        return {
          fixes: parsed.fixes.map((f: any) => ({
            path: String(f.path || ""),
            content: String(f.content || ""),
          })),
        };
      }
    }
  }

  throw new Error("Debugger response did not match required JSON structure { fixes: [...] }");
}

/**
 * Diagnoses build errors and generates targeted fixes across the project codebase.
 * Uses Mistral Codestral as primary engine with automatic fallback to OpenRouter GLM-5.2.
 */
export async function attemptFix(
  files: ProjectFile[],
  buildError: string,
  plan?: BuildPlan
): Promise<DebuggerResult> {
  const fileContext = files
    .map(
      (f) =>
        `--- FILE: ${f.path} ---\n${f.content}\n--- END OF FILE: ${f.path} ---`
    )
    .join("\n\n");

  const promptContent = `PROJECT ARCHITECTURE:
${plan ? `Project Name: ${plan.projectName}\nDescription: ${plan.description}` : "Vite + React + Tailwind CSS Web Application"}

CURRENT PROJECT FILES (FULL CONTEXT):
${fileContext}

RAW BUILD ERROR LOG:
${buildError}

Identify the root cause of the build error and return the JSON with corrected files. Output VALID JSON ONLY:`;

  const messages: Message[] = [
    { role: "system", content: DEBUGGER_SYSTEM_PROMPT },
    { role: "user", content: promptContent },
  ];

  // Helper for single attempt with self-correcting retry
  const executeDebuggerCall = async (
    caller: (msgs: Message[], opts?: any) => Promise<string>,
    providerName: string
  ): Promise<DebuggerResult> => {
    const raw = await caller(messages, { temperature: 0.1 });
    try {
      return parseDebuggerOutput(raw);
    } catch (parseError) {
      console.warn(`[Debugger ${providerName}] Initial JSON parse failed. Retrying with correction prompt...`);
      const retryMessages: Message[] = [
        ...messages,
        { role: "assistant", content: raw },
        {
          role: "user",
          content: `Your previous response had invalid JSON. Error: ${parseError instanceof Error ? parseError.message : String(parseError)}. Output ONLY a valid JSON object matching { "fixes": [ { "path": string, "content": string } ] }:`,
        },
      ];
      const retryRaw = await caller(retryMessages, { temperature: 0.0 });
      return parseDebuggerOutput(retryRaw);
    }
  };

  try {
    // 1. Primary Debugger Call: Mistral Codestral
    return await executeDebuggerCall(callMistral, "Mistral");
  } catch (mistralError) {
    console.warn(
      "[Debugger Engine] Mistral debugging failed. Falling back to OpenRouter (GLM-5.2)...",
      mistralError instanceof ProviderError ? mistralError.message : mistralError
    );

    // 2. Fallback Debugger Call: OpenRouter (GLM-5.2)
    try {
      return await executeDebuggerCall(callOpenRouter, "OpenRouter");
    } catch (openRouterError) {
      throw new Error(
        `Self-healing debugger failed across all AI providers: ${
          openRouterError instanceof Error ? openRouterError.message : String(openRouterError)
        }`
      );
    }
  }
}
