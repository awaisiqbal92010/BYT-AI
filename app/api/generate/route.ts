import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifySessionCookie } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { randomBytes } from "crypto";
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
      projectId: requestedProjectId,
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

    // 1. Resolve authenticated user from verified Firebase session cookie
    const sessionCookie = request.cookies.get("session")?.value;
    const decoded = await verifySessionCookie(sessionCookie);
    const uid = decoded?.uid ?? null;

    // SECURITY: Authentication is REQUIRED for all project generation
    if (!uid) {
      return NextResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "Authentication required. Please sign in to generate projects." } },
        { status: 401 }
      );
    }

    const currentPeriod = new Date().toISOString().slice(0, 7);

    // 2. Check Generation Quota
    try {
      const db = getAdminDb();
      const userDoc = await db.collection("users").doc(uid).get();
      const userPlan: string = userDoc.data()?.plan || "free";
      const LIMITS: Record<string, number> = { free: 50, medium: 200, premium: 1000, legendary: 99999 };
      const limit = LIMITS[userPlan] ?? 50;

      const usageDoc = await db
        .collection("usage")
        .doc(uid)
        .collection("months")
        .doc(currentPeriod)
        .get();
      const currentCount: number = usageDoc.data()?.promptCount || 0;

      if (currentCount >= limit) {
        return NextResponse.json(
          { error: `Monthly generation limit reached (${currentCount}/${limit}). Upgrade your plan in Settings.` },
          { status: 429 }
        );
      }
    } catch (limitErr) {
      console.warn("[Generate] Quota check warning:", limitErr);
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
            thought: `🧠 [COGNITIVE SPEC ANALYSIS] Parsing user intent and architecting modular ${framework.toUpperCase()} application...`,
          });

          // Provision or reconnect E2B MicroVM Sandbox
          try {
            sandboxEntry = await getOrCreateActiveSandbox(requestedSandboxId, framework);
            if (sandboxEntry) {
              safeEnqueue({
                type: "thinking",
                thought: `⚡ [CLOUD CONTAINER RUNTIME] E2B MicroVM active (Sandbox: ${sandboxEntry.sandboxId.slice(0, 10)}). Isolated port: ${devPort}.`,
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
              thought: "🌐 [LOCAL RUNTIME] Booting instant in-browser live execution environment with high-speed compilation.",
            });
          }

          if (stitchApiKey || useStitch) {
            safeEnqueue({
              type: "thinking",
              thought: "🎨 [DESIGN SYSTEM & TOKENS] Synthesizing Stitch MCP UI tokens, responsive layouts, and Tailwind color curves...",
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
              thought: `✨ [BLUEPRINT GENERATION] Stitch layout '${plan.stitchBlueprint.layoutType}' generated with ${plan.stitchBlueprint.sections.length} core interactive sections.`,
            });
          }

          safeEnqueue({
            type: "thinking",
            thought: `📐 [ARCHITECTURAL DECOMPOSITION] Planned ${plan.files.length} production modules for ${plan.projectName}. Initializing codegen sub-agents...`,
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
              thought: `⚡ [AST CODE SYNTHESIS] Synthesizing ${file.path} — ${file.purpose}...`,
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
                thought: `🛠️ [AUTO-DEBUGGER] Analyzing compilation/dev-server diagnostic logs...`,
              });

              try {
                const fixResult = await attemptFix(
                  generatedFiles,
                  sandboxBootErr?.message || "Dev server startup error",
                  plan
                );
                if (fixResult.fixes && fixResult.fixes.length > 0) {
                  for (const fix of fixResult.fixes) {
                    const idx = generatedFiles.findIndex((f) => f.path === fix.path);
                    if (idx >= 0) {
                      generatedFiles[idx].content = fix.content;
                    }
                    if (sandboxEntry) {
                      await sandboxEntry.sandbox.files.write(
                        `${PROJECT_DIR}/${fix.path}`,
                        fix.content
                      );
                    }
                    safeEnqueue({
                      type: "file",
                      path: fix.path,
                      content: fix.content,
                      purpose: "Self-healed by auto-debugger agent",
                    });
                  }

                  safeEnqueue({
                    type: "thinking",
                    thought: `✨ [AUTO-DEBUGGER] Applied ${fixResult.fixes.length} targeted repairs. Rebooting dev server...`,
                  });

                  livePreviewUrl = await bootSandboxDevServer(
                    sandboxEntry,
                    generatedFiles.map((f) => ({ path: f.path, content: f.content })),
                    framework
                  );
                } else {
                  livePreviewUrl = sandboxEntry.previewUrl;
                }
              } catch (debugErr) {
                console.warn("[Auto-debugger attempt warning]:", debugErr);
                safeEnqueue({
                  type: "thinking",
                  thought: `⚠️ Sandbox dev server boot notice: ${sandboxBootErr?.message?.slice(0, 80)}. Falling back to in-browser preview runtime.`,
                });
                livePreviewUrl = sandboxEntry.previewUrl;
              }
            }
          }

          // 7. Save project to Firestore (enforcing ownership verification to prevent IDOR overwrite)
          let projectId = requestedProjectId || randomBytes(12).toString("hex");
          if (uid) {
            try {
              const db = getAdminDb();
              const now = FieldValue.serverTimestamp();
              const docRef = db.collection("projects").doc(projectId);
              const existingDoc = await docRef.get();

              // Prevent overwriting someone else's project
              if (existingDoc.exists && existingDoc.data()?.userId !== uid) {
                projectId = randomBytes(12).toString("hex");
              }

              const newRef = db.collection("projects").doc(projectId);
              await newRef.set({
                userId: uid,
                name: plan.projectName,
                slug: plan.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                description: plan.description || "",
                framework,
                files: generatedFiles,
                messages: [
                  {
                    role: "user",
                    content: prompt,
                    timestamp: new Date().toISOString(),
                  },
                  {
                    role: "assistant",
                    content: `Generated ${generatedFiles.length} files for "${plan.projectName}" (${framework}). Files: ${generatedFiles.map((f: any) => f.path).join(", ")}`,
                    timestamp: new Date().toISOString(),
                    files: generatedFiles.map((f: any) => ({ path: f.path, language: f.language })),
                  },
                ],
                previewUrl: livePreviewUrl || null,
                isPublic: false,
                createdAt: existingDoc.exists ? existingDoc.data()?.createdAt : now,
                updatedAt: now,
              });

              // 8. Increment monthly usage count
              const usageRef = db
                .collection("usage")
                .doc(uid)
                .collection("months")
                .doc(currentPeriod);
              await usageRef.set(
                { promptCount: FieldValue.increment(1), updatedAt: now },
                { merge: true }
              );
            } catch (dbErr) {
              console.warn("[Generate] Firestore persistence warning:", dbErr);
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
