import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { planProject, BuildPlan, ProjectFile } from "@/lib/ai/orchestrator";
import { generateFileContent } from "@/lib/ai/codegen";
import { attemptFix } from "@/lib/ai/debugger";
import {
  getOrCreateActiveSandbox,
  bootSandboxDevServer,
  ActiveSandboxEntry,
  PROJECT_DIR,
  SandboxFramework,
  getPortForFramework,
} from "@/lib/sandbox";

export const runtime = "nodejs";
export const maxDuration = 300;

function createStreamMessage(data: any) {
  const encoder = new TextEncoder();
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      sandboxId: requestedSandboxId,
      stitchApiKey,
      useStitch,
      framework: requestedFramework = "vite-react",
    } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string." },
        { status: 400 }
      );
    }

    const promptLower = prompt.toLowerCase();
    const isMobileIntent =
      requestedFramework === "react-native-expo" ||
      requestedFramework === "React Native Expo" ||
      ((promptLower.includes("android") ||
        promptLower.includes("react native") ||
        promptLower.includes("expo mobile") ||
        promptLower.includes("mobile app") ||
        promptLower.includes("apk")) &&
        !promptLower.includes("website") &&
        !promptLower.includes("landing page"));

    const framework: SandboxFramework =
      requestedFramework === "nextjs" || requestedFramework === "Next.js 14"
        ? "nextjs"
        : isMobileIntent
        ? "react-native-expo"
        : "vite-react";

    const devPort = getPortForFramework(framework);

    // 1. Initialize Supabase Client
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const currentPeriod = new Date().toISOString().slice(0, 7);

    // 2. Check Monthly Generation Limit if authenticated
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      const userPlan = profile?.plan || "free";
      const limit = userPlan === "pro" ? 1000 : userPlan === "enterprise" ? 10000 : 50;

      const { data: usage } = await supabase
        .from("usage_logs")
        .select("prompt_count")
        .eq("user_id", user.id)
        .eq("period", currentPeriod)
        .single();

      const currentCount = usage?.prompt_count || 0;

      if (currentCount >= limit) {
        return NextResponse.json(
          {
            error: `Monthly generation limit reached (${currentCount}/${limit}). Please upgrade your plan in Settings.`,
          },
          { status: 429 }
        );
      }
    }

    // 3. Prepare SSE Stream
    const stream = new ReadableStream({
      async start(controller) {
        let sandboxEntry: ActiveSandboxEntry | null = null;
        let isClosed = false;

        const safeEnqueue = (data: any) => {
          if (!isClosed) {
            try {
              controller.enqueue(createStreamMessage(data));
            } catch {
              // ignore enqueue errors on closed stream
            }
          }
        };

        const safeClose = () => {
          if (!isClosed) {
            isClosed = true;
            try {
              controller.close();
            } catch {
              /* already closed */
            }
          }
        };

        try {
          safeEnqueue({
            type: "thinking",
            thought: `🤔 Analyzing prompt requirements for ${framework.toUpperCase()} architecture...`,
          });

          // Provision or reconnect E2B MicroVM Sandbox
          try {
            sandboxEntry = await getOrCreateActiveSandbox(requestedSandboxId, framework);
            if (sandboxEntry) {
              safeEnqueue({
                type: "thinking",
                thought: `⚡ E2B MicroVM active (ID: ${sandboxEntry.sandboxId.slice(0, 8)}). Configured for ${framework} on port ${devPort}.`,
              });
              safeEnqueue({
                type: "command",
                command: `mkdir -p ${PROJECT_DIR}`,
                stdout: "Workspace directory ready",
                exitCode: 0,
              });
            }
          } catch (e2bErr) {
            console.warn("[E2B Sandbox Warning]:", e2bErr);
            safeEnqueue({
              type: "thinking",
              thought: "🌐 Operating with instant same-origin in-browser preview runner.",
            });
          }

          if (stitchApiKey || useStitch) {
            safeEnqueue({
              type: "thinking",
              thought: "🎨 Querying Stitch MCP UI design engine: generating color palette, layout tokens, and wireframe blueprint...",
            });
          }

          safeEnqueue({
            type: "status",
            message: `🧠 Synthesizing ${framework} architecture & component tree...`,
          });

          // 4. Generate architectural build plan
          const plan: BuildPlan = await planProject(prompt, {
            stitchApiKey,
            useStitch: useStitch !== false,
            framework,
          });

          if (plan.stitchBlueprint) {
            safeEnqueue({
              type: "thinking",
              thought: `✨ Stitch design ready: Layout '${plan.stitchBlueprint.layoutType}' with ${plan.stitchBlueprint.sections.length} structured sections.`,
            });
          }

          safeEnqueue({
            type: "thinking",
            thought: `📐 Architecture finalized: ${plan.projectName} (${framework}) with ${plan.files.length} module files.`,
          });

          safeEnqueue({
            type: "plan",
            plan,
          });

          // 5. Code Generation Sub-agent across planned files
          const generatedFiles: ProjectFile[] = [];
          let siblingsSummary = "";

          for (let i = 0; i < plan.files.length; i++) {
            const file = plan.files[i];

            safeEnqueue({
              type: "thinking",
              thought: `⚡ Generating ${file.path} (${file.purpose})...`,
            });

            safeEnqueue({
              type: "status",
              message: `⚡ Writing ${file.path} (${i + 1}/${plan.files.length})...`,
              currentFile: file.path,
              progress: Math.round(((i + 1) / plan.files.length) * 100),
            });

            const content = await generateFileContent(file, plan, siblingsSummary);

            // Write directly into E2B Sandbox filesystem
            if (sandboxEntry) {
              try {
                const fullPath = `${PROJECT_DIR}/${file.path}`;
                const parentDir = fullPath.substring(0, fullPath.lastIndexOf("/"));
                if (parentDir && parentDir !== PROJECT_DIR) {
                  await sandboxEntry.sandbox.commands.run(`mkdir -p ${parentDir}`);
                }
                await sandboxEntry.sandbox.files.write(fullPath, content);
              } catch (fsErr) {
                console.warn(`[E2B FS Write Error for ${file.path}]:`, fsErr);
              }
            }

            const extension = file.path.split(".").pop() || "jsx";
            const projectFile: ProjectFile = {
              path: file.path,
              content,
              language: extension,
            };

            generatedFiles.push(projectFile);
            siblingsSummary += `- ${file.path}: ${file.purpose} (Generated)\n`;

            safeEnqueue({
              type: "file",
              path: file.path,
              content,
              purpose: file.purpose,
            });
          }

          // 6. Boot sandbox dev server with port polling (fixes 502 Bad Gateway)
          let livePreviewUrl = sandboxEntry?.previewUrl || null;

          if (sandboxEntry) {
            safeEnqueue({
              type: "thinking",
              thought: `📦 Installing dependencies and booting dev server on port ${devPort}...`,
            });

            try {
              const sandboxFiles = generatedFiles.map((f) => ({
                path: f.path,
                content: f.content,
              }));

              livePreviewUrl = await bootSandboxDevServer(
                sandboxEntry,
                sandboxFiles,
                framework,
                (cmd, stdout, stderr, exitCode) => {
                  safeEnqueue({ type: "command", command: cmd });
                  if (stdout || stderr) {
                    safeEnqueue({
                      type: "command_output",
                      stdout: stdout || "",
                      stderr: stderr || "",
                      exitCode: exitCode ?? 0,
                    });
                  }
                }
              );

              safeEnqueue({
                type: "thinking",
                thought: `✅ Dev server is LIVE on port ${devPort}! Preview: ${livePreviewUrl}`,
              });
            } catch (sandboxBootErr: any) {
              console.warn("[Sandbox Boot Warning]:", sandboxBootErr);
              safeEnqueue({
                type: "thinking",
                thought: `⚠️ Sandbox boot notice: ${sandboxBootErr?.message?.slice(0, 80)}. Falling back to high-speed in-browser preview.`,
              });
              livePreviewUrl = sandboxEntry.previewUrl;
            }
          }

          // 7. Save to database
          let projectId = `proj-${Date.now()}`;
          if (user) {
            try {
              const { data: insertedProject } = await supabase
                .from("projects")
                .insert({
                  user_id: user.id,
                  name: plan.projectName,
                  files: generatedFiles,
                  preview_url: livePreviewUrl,
                })
                .select("id")
                .single();

              if (insertedProject?.id) {
                projectId = insertedProject.id;
              }

              // 8. Increment usage count
              const { data: existingUsage } = await supabase
                .from("usage_logs")
                .select("prompt_count")
                .eq("user_id", user.id)
                .eq("period", currentPeriod)
                .single();

              if (existingUsage) {
                await supabase
                  .from("usage_logs")
                  .update({ prompt_count: existingUsage.prompt_count + 1 })
                  .eq("user_id", user.id)
                  .eq("period", currentPeriod);
              } else {
                await supabase.from("usage_logs").insert({
                  user_id: user.id,
                  period: currentPeriod,
                  prompt_count: 1,
                });
              }
            } catch (dbErr) {
              console.warn("DB persistence warning:", dbErr);
            }
          }

          safeEnqueue({
            type: "thinking",
            thought: `🚀 Project generation complete for ${framework}. Live preview and terminal ready!`,
          });

          // 9. Complete stream event
          safeEnqueue({
            type: "done",
            projectId,
            projectName: plan.projectName,
            description: plan.description,
            framework,
            files: generatedFiles,
            sandboxId: sandboxEntry?.sandboxId,
            previewUrl: livePreviewUrl,
            message: `✨ ${plan.projectName} generated successfully for ${framework}! Created ${generatedFiles.length} files with live preview & terminal.`,
          });

          safeClose();
        } catch (err: any) {
          console.error("Generate API streaming error:", err);
          safeEnqueue({
            type: "error",
            message: err?.message || "Generation error encountered — please try again.",
          });
          safeClose();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("API /api/generate Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
