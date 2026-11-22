"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, Eye, ShieldAlert, ArrowLeft, Loader2, Code2 } from "lucide-react";
import { WorkbenchHeader, WorkbenchViewMode, WorkbenchUserData } from "@/components/builder/WorkbenchHeader";
import { ChatSidebar, ChatMessage } from "@/components/builder/ChatSidebar";
import { FileTreeExplorer, FileItem } from "@/components/builder/FileTreeExplorer";
import { CodeEditorView, OpenTab } from "@/components/builder/CodeEditorView";
import { LivePreviewSandbox } from "@/components/builder/LivePreviewSandbox";
import { TerminalDrawer, TerminalLogEntry } from "@/components/builder/TerminalDrawer";
import { ComponentInserterModal } from "@/components/builder/ComponentInserterModal";
import { ExportDeployModal } from "@/components/builder/ExportDeployModal";
import { CommandPalette } from "@/components/CommandPalette";
import { ExecutionStep } from "@/components/builder/ActivityStreamer";
import { useAuth } from "@/lib/firebase/auth-context";
import { AuthRequiredModal } from "@/components/builder/AuthRequiredModal";
import { StitchKeyModal } from "@/components/builder/StitchKeyModal";
import { MobileAppBuildModal } from "@/components/builder/MobileAppBuildModal";
import { Button } from "@/components/ui/button";
import {
  SavedProject,
  getProjectById,
  saveProject,
  duplicateProject,
  fetchProjectByIdAsync,
  generateProjectId,
} from "@/lib/project-storage";
import { downloadProjectAsZip } from "@/lib/export-zip";

function findFileInTree(items: FileItem[], targetPath: string): FileItem | null {
  for (const item of items) {
    if (item.path === targetPath || item.id === targetPath) return item;
    if (item.children) {
      const found = findFileInTree(item.children, targetPath);
      if (found) return found;
    }
  }
  return null;
}

function convertFlatFilesToFileTree(flat: Array<{ path: string; content: string }>): FileItem[] {
  const root: FileItem[] = [];
  for (const f of flat) {
    const parts = f.path.split("/").filter(Boolean);
    if (parts.length === 1) {
      root.push({
        id: f.path,
        name: f.path,
        path: f.path,
        type: "file",
        extension: (f.path.split(".").pop() as any) || "tsx",
        content: f.content,
      });
    } else {
      let currentLevel = root;
      let accumulatedPath = "";
      for (let i = 0; i < parts.length - 1; i++) {
        accumulatedPath = accumulatedPath ? `${accumulatedPath}/${parts[i]}` : parts[i];
        let folder = currentLevel.find((item) => item.path === accumulatedPath && item.type === "folder");
        if (!folder) {
          folder = {
            id: accumulatedPath,
            name: parts[i],
            path: accumulatedPath,
            type: "folder",
            children: [],
          };
          currentLevel.push(folder);
        }
        if (!folder.children) folder.children = [];
        currentLevel = folder.children;
      }
      const fileName = parts[parts.length - 1];
      currentLevel.push({
        id: f.path,
        name: fileName,
        path: f.path,
        type: "file",
        extension: (fileName.split(".").pop() as any) || "tsx",
        content: f.content,
      });
    }
  }
  return root;
}

export default function AppEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Clean 24-character hex ID (e.g. 6a71c49df3e1253811f86cd0)
  const projectId = (params?.id as string) || generateProjectId();
  const rawView = Array.isArray(params?.view) ? params.view[0] : (params?.view as string) || "preview";
  const initialViewMode: WorkbenchViewMode = rawView === "code" ? "code" : rawView === "split" ? "split" : "preview";

  // Check URL query prompt only as legacy fallback (clean URLs don't have prompt in query)
  const legacyPrompt = searchParams?.get("prompt");
  const rawFw = searchParams?.get("framework");
  const initialFramework: "Next.js 14" | "Vite + React" | "React Native Expo" =
    rawFw === "React Native Expo" || rawFw === "react-native-expo"
      ? "React Native Expo"
      : rawFw === "Next.js 14" || rawFw === "nextjs"
      ? "Next.js 14"
      : "Vite + React";

  // State
  const [isLoadingProject, setIsLoadingProject] = React.useState(true);
  const [accessDenied, setAccessDenied] = React.useState(false);
  const [projectName, setProjectName] = React.useState("My New Project");
  const [viewMode, setViewMode] = React.useState<WorkbenchViewMode>(initialViewMode);
  const [selectedModel, setSelectedModel] = React.useState("claude-3-7");
  const [framework, setFramework] = React.useState<"Next.js 14" | "Vite + React" | "React Native Expo">(initialFramework);
  const [mobileTab, setMobileTab] = React.useState<"chat" | "workbench">("chat");
  const [user, setUser] = React.useState<WorkbenchUserData | undefined>(undefined);
  const [sandboxId, setSandboxId] = React.useState<string | null>(null);
  const [e2bPreviewUrl, setE2bPreviewUrl] = React.useState<string | null>(null);

  // File explorer & Editor state
  const [files, setFiles] = React.useState<FileItem[]>([]);
  const [openTabs, setOpenTabs] = React.useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string>("");

  // Saving state
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [lastSavedTime, setLastSavedTime] = React.useState<string | null>(null);

  // AI Chat & Streamer state
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [currentSteps, setCurrentSteps] = React.useState<ExecutionStep[]>([]);
  const [agentThoughts, setAgentThoughts] = React.useState<string[]>([]);
  const [activeCommand, setActiveCommand] = React.useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = React.useState<TerminalLogEntry[]>([]);

  // Modals
  const [isInserterOpen, setIsInserterOpen] = React.useState(false);
  const [isExportDeployOpen, setIsExportDeployOpen] = React.useState(false);
  const [exportDeployDefaultTab, setExportDeployDefaultTab] = React.useState<"zip" | "github" | "deploy">("deploy");
  const [isTerminalOpen, setIsTerminalOpen] = React.useState(false);
  const [isTerminalMaximized, setIsTerminalMaximized] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isStitchModalOpen, setIsStitchModalOpen] = React.useState(false);
  const [isMobileBuildModalOpen, setIsMobileBuildModalOpen] = React.useState(false);

  // Synchronize view mode with compact URL
  const handleViewModeChange = React.useCallback((mode: WorkbenchViewMode) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      const targetPath = `/apps/${projectId}/editor/${mode}`;
      window.history.replaceState(null, "", targetPath);
    }
  }, [projectId]);

  // Convert FileItems to flat Array<{ path: string; content: string }> for export and preview
  const flatFiles = React.useMemo(() => {
    const flatten = (items: FileItem[]): Array<{ path: string; content: string }> => {
      let result: Array<{ path: string; content: string }> = [];
      for (const item of items) {
        if (item.type === "file" && item.content !== undefined) {
          result.push({ path: item.path, content: item.content });
        }
        if (item.children) {
          result = result.concat(flatten(item.children));
        }
      }
      return result;
    };
    return flatten(files);
  }, [files]);

  const { user: authUser } = useAuth();

  // Load user data
  React.useEffect(() => {
    if (authUser) {
      setUser({
        id: authUser.uid,
        email: authUser.email || undefined,
        github_username:
          authUser.displayName ||
          authUser.email?.split("@")[0] ||
          "Muhammad Iqbal",
        avatar_url: authUser.photoURL || undefined,
        plan: "free",
      });
    } else {
      setUser(undefined);
    }
  }, [authUser]);

  // Load Project by ID with strict per-user ownership validation
  React.useEffect(() => {
    async function load() {
      setIsLoadingProject(true);
      try {
        const proj = await fetchProjectByIdAsync(projectId);
        if (proj) {
          setProjectName(proj.name);
          if (proj.framework) {
            setFramework(proj.framework as any);
          }
          const tree = convertFlatFilesToFileTree(proj.files || []);
          setFiles(tree);

          if (proj.files && proj.files.length > 0) {
            const defaultTabs: OpenTab[] = proj.files.slice(0, 3).map((f) => ({
              id: f.path,
              name: f.path.split("/").pop() || f.path,
              path: f.path,
              content: f.content,
            }));
            setOpenTabs(defaultTabs);
            setActiveTabId(proj.activeTabId || defaultTabs[0]?.path || "");
          }

          if (proj.messages && proj.messages.length > 0) {
            setMessages(proj.messages as ChatMessage[]);
          }

          if (proj.e2bPreviewUrl) {
            setE2bPreviewUrl(proj.e2bPreviewUrl);
          }
          if (proj.sandboxId) {
            setSandboxId(proj.sandboxId);
          }
          if (proj.agentThoughts) {
            setAgentThoughts(proj.agentThoughts);
          }
          if (proj.terminalLogs) {
            setTerminalLogs(proj.terminalLogs);
          }
        }
      } catch (err: any) {
        if (err?.message === "UNAUTHORIZED_ACCESS") {
          setAccessDenied(true);
        }
      } finally {
        setIsLoadingProject(false);
      }
    }

    load();
  }, [projectId]);

  // Handle Initial Pending Build Prompt from sessionStorage (Clean URL without query params)
  const hasTriggeredInitialPrompt = React.useRef(false);
  const handleSendMessageRef = React.useRef<((prompt: string) => Promise<void>) | undefined>(undefined);

  React.useEffect(() => {
    if (isLoadingProject || hasTriggeredInitialPrompt.current || messages.length > 0) return;

    if (typeof window !== "undefined") {
      let promptToRun = legacyPrompt;
      let fwToRun = initialFramework;

      try {
        const rawPending = sessionStorage.getItem("byt_pending_build");
        if (rawPending) {
          const pending = JSON.parse(rawPending);
          // If pending belongs to this project or is a fresh generation
          if (pending && pending.prompt) {
            promptToRun = pending.prompt;
            if (pending.framework) {
              fwToRun = pending.framework;
              setFramework(pending.framework);
            }
            // Clear pending so it does not re-trigger on refresh
            sessionStorage.removeItem("byt_pending_build");
          }
        }
      } catch (e) {
        console.warn("Could not read pending build from sessionStorage", e);
      }

      if (promptToRun && handleSendMessageRef.current) {
        hasTriggeredInitialPrompt.current = true;
        handleSendMessageRef.current(promptToRun);
      }
    }
  }, [isLoadingProject, legacyPrompt, initialFramework, messages.length]);

  // Save project handler
  const handleSaveProject = React.useCallback(async () => {
    setIsSaving(true);
    try {
      await saveProject({
        id: projectId,
        name: projectName,
        framework,
        files: flatFiles,
        messages: messages,
        activeTabId,
        sandboxId,
        e2bPreviewUrl,
        agentThoughts,
        terminalLogs,
      });
      setHasUnsavedChanges(false);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setIsSaving(false);
    }
  }, [
    projectId,
    projectName,
    framework,
    flatFiles,
    messages,
    activeTabId,
    sandboxId,
    e2bPreviewUrl,
    agentThoughts,
    terminalLogs,
  ]);

  // Keyboard shortcut Ctrl+S / Cmd+S to save project, Cmd+P to toggle preview/code
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveProject();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handleViewModeChange(viewMode === "preview" ? "code" : "preview");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveProject, handleViewModeChange, viewMode]);

  const handleDuplicateProject = async () => {
    const dup = await duplicateProject(projectId);
    if (dup) {
      router.push(`/apps/${dup.id}/editor/preview`);
    }
  };

  const handleSelectFile = (file: FileItem) => {
    if (file.type === "file") {
      const exists = openTabs.find((t) => t.path === file.path);
      if (!exists) {
        setOpenTabs([
          ...openTabs,
          {
            id: file.id,
            name: file.name,
            path: file.path,
            content: file.content || "",
          },
        ]);
      }
      setActiveTabId(file.path);
    }
  };

  const handleCloseTab = (tabId: string) => {
    const nextTabs = openTabs.filter((t) => t.path !== tabId);
    setOpenTabs(nextTabs);
    if (activeTabId === tabId) {
      setActiveTabId(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1].path : "");
    }
  };

  const handleCodeChange = (newCode: string) => {
    setHasUnsavedChanges(true);
    setOpenTabs(
      openTabs.map((tab) => (tab.path === activeTabId ? { ...tab, content: newCode } : tab))
    );

    const updateNestedFile = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.path === activeTabId) {
          return { ...item, content: newCode };
        }
        if (item.children) {
          return { ...item, children: updateNestedFile(item.children) };
        }
        return item;
      });
    };

    setFiles(updateNestedFile(files));
  };

  const handleDirectDownloadZip = React.useCallback(async () => {
    try {
      await downloadProjectAsZip(flatFiles, projectName);
    } catch (err) {
      console.error("Failed to download project ZIP:", err);
    }
  }, [flatFiles, projectName]);

  const handleSendMessage = async (prompt: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      timestamp: "Just now",
      content: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);
    setHasUnsavedChanges(true);
    setAgentThoughts([]);
    setActiveCommand(null);

    const steps: ExecutionStep[] = [
      { id: "1", title: "Synthesizing Architecture & Tokens", status: "in_progress" },
    ];
    setCurrentSteps(steps);

    // Maintain accumulating map of files across stream
    const accumulatedFiles = new Map<string, string>();
    flatFiles.forEach((f) => accumulatedFiles.set(f.path, f.content));

    let stitchKey = "";
    let stitchEnabled = true;
    if (typeof window !== "undefined") {
      stitchKey = localStorage.getItem("byt_stitch_api_key") || "";
      stitchEnabled = localStorage.getItem("byt_stitch_enabled") !== "false";
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          projectId,
          sandboxId: sandboxId || undefined,
          stitchApiKey: stitchKey || undefined,
          useStitch: stitchEnabled,
          framework,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Generation failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.replace(/^data: /, "").trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "thinking") {
              setAgentThoughts((prev) => [...prev, event.thought]);
            } else if (event.type === "command") {
              setActiveCommand(event.command);
              const time = new Date().toLocaleTimeString().split(" ")[0];
              setTerminalLogs((prev) => [
                ...prev,
                { time, type: "command", text: `$ ${event.command}` },
              ]);
            } else if (event.type === "command_output") {
              setActiveCommand(null);
              const time = new Date().toLocaleTimeString().split(" ")[0];
              const newLogs: TerminalLogEntry[] = [];
              if (event.stdout) {
                event.stdout.split("\n").forEach((l: string) => {
                  if (l.trim()) newLogs.push({ time, type: "info", text: l });
                });
              }
              if (event.stderr) {
                event.stderr.split("\n").forEach((l: string) => {
                  if (l.trim()) newLogs.push({ time, type: event.exitCode === 0 ? "info" : "error", text: l });
                });
              }
              if (newLogs.length > 0) {
                setTerminalLogs((prev) => [...prev, ...newLogs]);
              }
            } else if (event.type === "status") {
              setCurrentSteps((prev) =>
                prev.map((s) => ({
                  ...s,
                  status: "in_progress",
                  detail: event.message,
                }))
              );
            } else if (event.type === "plan") {
              if (event.plan?.projectName) {
                setProjectName(event.plan.projectName);
              }
              setCurrentSteps([
                { id: "1", title: "Architecture & Blueprint Created", status: "completed" },
                { id: "2", title: "Synthesizing Source Files", status: "in_progress" },
              ]);
            } else if (event.type === "file") {
              accumulatedFiles.set(event.path, event.content);
              const flatArr = Array.from(accumulatedFiles.entries()).map(([path, content]) => ({
                path,
                content,
              }));
              const newTree = convertFlatFilesToFileTree(flatArr);
              setFiles(newTree);

              setOpenTabs((prev) => {
                const existing = prev.find((t) => t.path === event.path);
                if (existing) {
                  return prev.map((t) => (t.path === event.path ? { ...t, content: event.content } : t));
                }
                const fileName = event.path.split("/").pop() || event.path;
                return [...prev, { id: event.path, name: fileName, path: event.path, content: event.content }];
              });

              if (!activeTabId || activeTabId === "src/App.tsx" || activeTabId === "app/page.tsx") {
                setActiveTabId(event.path);
              }
            } else if (event.type === "done") {
              if (event.sandboxId) setSandboxId(event.sandboxId);
              if (event.previewUrl) setE2bPreviewUrl(event.previewUrl);

              setCurrentSteps([
                { id: "1", title: "Architecture & Design System", status: "completed" },
                { id: "2", title: `Synthesized ${event.files?.length || 0} Modules`, status: "completed" },
                { id: "3", title: "Fast Refresh Dev Server Active", status: "completed" },
              ]);

              const aiMsg: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: "assistant",
                timestamp: "Just now",
                content:
                  event.message ||
                  `✨ Generated ${event.projectName || projectName} with live hot-reloading!`,
                files: (event.files || []).map((f: any) => ({
                  name: f.path,
                  action: "created",
                })),
              };
              setMessages((prev) => {
                const nextMessages = [...prev, aiMsg];
                // Auto-persist project state to ensure chat history & files are preserved permanently
                const flatGenerated =
                  event.files && event.files.length > 0
                    ? event.files
                    : Array.from(accumulatedFiles.entries()).map(([path, content]) => ({ path, content }));
                saveProject({
                  id: projectId,
                  name: event.projectName || projectName,
                  framework,
                  files: flatGenerated,
                  messages: nextMessages,
                  sandboxId: event.sandboxId || sandboxId,
                  e2bPreviewUrl: event.previewUrl || e2bPreviewUrl,
                }).catch((saveErr) => console.warn("[AutoSave] Failed to persist generation state:", saveErr));
                return nextMessages;
              });
            } else if (event.type === "error") {
              const errorMsg: ChatMessage = {
                id: `ai-err-${Date.now()}`,
                sender: "assistant",
                timestamp: "Just now",
                content: `⚠️ Error during synthesis: ${event.message}`,
              };
              setMessages((prev) => [...prev, errorMsg]);
            }
          } catch (jsonErr) {
            console.error("JSON parse error on SSE stream line:", jsonErr);
          }
        }
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: "assistant",
        timestamp: "Just now",
        content: `⚠️ Generation Note: ${err?.message || "Encountered an issue during AI synthesis."}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
      setActiveCommand(null);
    }
  };

  handleSendMessageRef.current = handleSendMessage;

  const activeTab = openTabs.find((t) => t.path === activeTabId) || openTabs[0];

  // Render Strict Access Restricted Screen
  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-destructive/30 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Project Access Restricted</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This project is private and belongs to another account. BYT strictly enforces per-user project isolation so other accounts cannot view or modify your work.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              onClick={() => router.push(`/login?next=/apps/${projectId}/editor/preview`)}
              variant="primary"
              className="w-full"
            >
              Sign in with Authorized Account
            </Button>
            <Button onClick={() => router.push("/projects")} variant="outline" className="w-full">
              Return to My Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (isLoadingProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Loading project workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
      {/* 1. Universal Top Header */}
      <WorkbenchHeader
        currentProjectId={projectId}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        selectedModel={selectedModel}
        onSelectedModelChange={setSelectedModel}
        framework={framework}
        onFrameworkChange={(fw) => setFramework(fw as any)}
        onOpenMobileBuild={() => setIsMobileBuildModalOpen(true)}
        onOpenInserter={() => setIsInserterOpen(true)}
        onOpenExportDeploy={(tab) => {
          setExportDeployDefaultTab(tab || "deploy");
          setIsExportDeployOpen(true);
        }}
        onNewProject={() => {
          const newId = generateProjectId();
          router.push(`/apps/${newId}/editor/preview`);
        }}
        onOpenStitch={() => setIsStitchModalOpen(true)}
        user={user}
        onSaveProject={handleSaveProject}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSavedTime={lastSavedTime}
        onSelectProject={(id) => router.push(`/apps/${id}/editor/preview`)}
        onDuplicateProject={handleDuplicateProject}
        filesCount={flatFiles.length}
        onDownloadZip={handleDirectDownloadZip}
      />

      {/* 2. Workspace Body: Left Chat Sidebar + Right Canvas Workbench */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side: Autonomous AI Chat & Activity Streamer */}
        <div
          className={`h-full border-r border-border bg-card/60 transition-all duration-200 z-10 shrink-0 ${
            mobileTab === "chat" ? "w-full md:w-[380px] lg:w-[410px]" : "hidden md:flex md:w-[380px] lg:w-[410px]"
          }`}
        >
          <ChatSidebar
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            onNewChat={() => setMessages([])}
            onResetChat={() => {
              setMessages([]);
              setFiles([]);
              setOpenTabs([]);
            }}
            onSelectFile={(filePath) => {
              const fileItem = findFileInTree(files, filePath);
              if (fileItem) {
                handleSelectFile(fileItem);
                handleViewModeChange("code");
              }
            }}
            onViewCode={() => handleViewModeChange("code")}
            onDownloadZip={handleDirectDownloadZip}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            currentSteps={currentSteps}
            agentThoughts={agentThoughts}
            activeCommand={activeCommand}
          />
        </div>

        {/* Right Side: Dual-Mode Workspace (Code vs. Preview vs. Split) */}
        <div
          className={`flex-1 h-full overflow-hidden flex flex-col relative ${
            mobileTab === "workbench" ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Top Quick Toggle Pill Bar (Always visible for instantaneous Code <-> Preview switching) */}
          <div className="h-9 px-4 border-b border-border/70 bg-card/40 backdrop-blur flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Canvas:</span>
              <div className="inline-flex rounded-lg p-0.5 bg-muted/60 border border-border/60">
                <button
                  onClick={() => handleViewModeChange("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === "preview"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleViewModeChange("code")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === "code"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Code</span>
                  {flatFiles.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400">
                      {flatFiles.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
              <span className="hidden sm:inline">Hotkey: <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">Ctrl+P</kbd></span>
              <span className="text-zinc-600">|</span>
              <span className="text-primary/90 font-medium">/apps/{projectId.slice(0, 8)}...</span>
            </div>
          </div>

          {/* Workbench Canvas Rendering */}
          <div className="flex-1 flex overflow-hidden relative">
            {viewMode === "preview" && (
              <div className="flex-1 h-full overflow-hidden">
                <LivePreviewSandbox
                  files={flatFiles}
                  framework={framework}
                  initialPreviewUrl={e2bPreviewUrl}
                  projectName={projectName}
                  onViewCode={() => handleViewModeChange("code")}
                  onDownloadZip={handleDirectDownloadZip}
                  onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
                  isTerminalOpen={isTerminalOpen}
                />
              </div>
            )}

            {viewMode === "code" && (
              <div className="flex-1 h-full flex overflow-hidden">
                <FileTreeExplorer
                  files={files}
                  activeFilePath={activeTabId}
                  onSelectFile={handleSelectFile}
                  onDeleteFile={(filePath) => {
                    const next = flatFiles.filter((f) => f.path !== filePath);
                    setFiles(convertFlatFilesToFileTree(next));
                    handleCloseTab(filePath);
                  }}
                />
                <div className="flex-1 h-full overflow-hidden">
                  <CodeEditorView
                    tabs={openTabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                    onCloseTab={handleCloseTab}
                    onCodeChange={(_id, newCode) => handleCodeChange(newCode)}
                    onSwitchToPreview={() => handleViewModeChange("preview")}
                  />
                </div>
              </div>
            )}

            {viewMode === "split" && (
              <div className="flex-1 h-full flex overflow-hidden divide-x divide-border">
                <div className="w-1/2 h-full flex overflow-hidden">
                  <FileTreeExplorer
                    files={files}
                    activeFilePath={activeTabId}
                    onSelectFile={handleSelectFile}
                  />
                  <div className="flex-1 h-full overflow-hidden">
                    <CodeEditorView
                      tabs={openTabs}
                      activeTabId={activeTabId}
                      onSelectTab={setActiveTabId}
                      onCloseTab={handleCloseTab}
                      onCodeChange={(_id, newCode) => handleCodeChange(newCode)}
                      onSwitchToPreview={() => handleViewModeChange("preview")}
                    />
                  </div>
                </div>
                <div className="w-1/2 h-full overflow-hidden">
                  <LivePreviewSandbox
                    files={flatFiles}
                    framework={framework}
                    initialPreviewUrl={e2bPreviewUrl}
                    projectName={projectName}
                    onViewCode={() => handleViewModeChange("code")}
                    onDownloadZip={handleDirectDownloadZip}
                    onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
                    isTerminalOpen={isTerminalOpen}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Sandbox Terminal Drawer */}
          <TerminalDrawer
            isOpen={isTerminalOpen}
            onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
            onClose={() => setIsTerminalOpen(false)}
            isMaximized={isTerminalMaximized}
            onToggleMaximize={() => setIsTerminalMaximized(!isTerminalMaximized)}
            sandboxId={sandboxId}
            externalLogs={terminalLogs}
            files={flatFiles}
          />
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex items-center justify-around border-t border-border bg-card p-2 text-xs">
        <button
          onClick={() => setMobileTab("chat")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
            mobileTab === "chat" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>AI Engine</span>
        </button>
        <button
          onClick={() => setMobileTab("workbench")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
            mobileTab === "workbench" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Workbench</span>
        </button>
      </div>

      {/* Global Inserter & Export Modals */}
      <ComponentInserterModal
        isOpen={isInserterOpen}
        onClose={() => setIsInserterOpen(false)}
        onInsert={(comp) => {
          handleSendMessage(`Insert the ${comp.name} component into the project with high-conversion styling.`);
          setIsInserterOpen(false);
        }}
      />

      <ExportDeployModal
        isOpen={isExportDeployOpen}
        onClose={() => setIsExportDeployOpen(false)}
        projectName={projectName}
        files={flatFiles}
        defaultTab={exportDeployDefaultTab}
      />

      <MobileAppBuildModal
        isOpen={isMobileBuildModalOpen}
        onClose={() => setIsMobileBuildModalOpen(false)}
        projectName={projectName}
        files={flatFiles}
        previewUrl={e2bPreviewUrl}
      />

      <StitchKeyModal
        isOpen={isStitchModalOpen}
        onClose={() => setIsStitchModalOpen(false)}
      />
    </div>
  );
}
