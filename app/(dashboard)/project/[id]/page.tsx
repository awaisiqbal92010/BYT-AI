"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, Eye, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
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

export default function ProjectBuilderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const projectId = (params?.id as string) || `proj-${Date.now()}`;
  const initialPrompt = searchParams?.get("prompt");

  // State
  const [isLoadingProject, setIsLoadingProject] = React.useState(true);
  const [accessDenied, setAccessDenied] = React.useState(false);
  const [projectName, setProjectName] = React.useState("My New Project");
  const [viewMode, setViewMode] = React.useState<WorkbenchViewMode>("preview");
  const [selectedModel, setSelectedModel] = React.useState("claude-3-7");
  const [framework, setFramework] = React.useState<"Next.js 14" | "Vite + React" | "React Native Expo">("Vite + React");
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

  // Load user data
  React.useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();

          setUser({
            id: authUser.id,
            email: authUser.email,
            github_username:
              profile?.github_username ||
              authUser.user_metadata?.user_name ||
              authUser.user_metadata?.preferred_username ||
              authUser.email?.split("@")[0],
            avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
            plan: profile?.plan || "free",
          });
        }
      } catch (err) {
        console.warn("Failed to load user profile:", err);
      }
    }

    loadUser();
  }, []);

  // Load Project by ID with strict ownership validation
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
        } else if (initialPrompt) {
          // New project with prompt query
          setProjectName("New AI Project");
          const fwParam = searchParams?.get("framework");
          if (fwParam) {
            setFramework(fwParam as any);
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
  }, [projectId, searchParams, initialPrompt]);

  // Handle Initial Prompt if passed in URL query
  const hasTriggeredInitialPrompt = React.useRef(false);
  const handleSendMessageRef = React.useRef<(prompt: string) => Promise<void>>();

  React.useEffect(() => {
    if (!isLoadingProject && initialPrompt && !hasTriggeredInitialPrompt.current && messages.length === 0) {
      hasTriggeredInitialPrompt.current = true;
      handleSendMessageRef.current?.(initialPrompt);
    }
  }, [isLoadingProject, initialPrompt, messages.length]);

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

  // Keyboard shortcut Ctrl+S / Cmd+S to save project
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveProject();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveProject]);

  const handleDuplicateProject = async () => {
    const dup = await duplicateProject(projectId);
    if (dup) {
      router.push(`/project/${dup.id}`);
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
      { id: "1", title: "Synthesizing UI Architecture & Tokens", status: "in_progress" },
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
                  status: s.id === event.stepId ? "in_progress" : "completed",
                }))
              );
            } else if (event.type === "sandbox_ready") {
              if (event.previewUrl) setE2bPreviewUrl(event.previewUrl);
              if (event.sandboxId) setSandboxId(event.sandboxId);
            } else if (event.type === "file" || event.type === "file_written") {
              accumulatedFiles.set(event.path, event.content);
              const currentFlat = Array.from(accumulatedFiles.entries()).map(([path, content]) => ({ path, content }));
              const fileTree = convertFlatFilesToFileTree(currentFlat);
              setFiles(fileTree);

              if (typeof window !== "undefined") {
                try {
                  localStorage.setItem("byt_active_preview_files", JSON.stringify(currentFlat));
                } catch (storageErr) {}
              }

              const fileName = event.path.split("/").pop() || event.path;
              setOpenTabs((prev) => {
                const exists = prev.find((t) => t.path === event.path);
                if (exists) {
                  return prev.map((t) => (t.path === event.path ? { ...t, content: event.content } : t));
                }
                return [
                  ...prev,
                  {
                    id: event.path,
                    name: fileName,
                    path: event.path,
                    content: event.content,
                  },
                ];
              });
              setActiveTabId(event.path);
            } else if (event.type === "done") {
              setCurrentSteps((prev) => prev.map((s) => ({ ...s, status: "completed" })));
              if (event.sandboxId) setSandboxId(event.sandboxId);
              if (event.previewUrl) setE2bPreviewUrl(event.previewUrl);

              if (event.files && Array.isArray(event.files) && event.files.length > 0) {
                event.files.forEach((f: any) => accumulatedFiles.set(f.path, f.content));
                const finalFlat = Array.from(accumulatedFiles.entries()).map(([path, content]) => ({ path, content }));
                setFiles(convertFlatFilesToFileTree(finalFlat));
              }

              const finalFlatList = Array.from(accumulatedFiles.entries()).map(([path, content]) => ({ path, content }));

              const createdFiles = (event.files || finalFlatList).map((f: any) => ({
                name: f.path,
                action: "created" as const,
              }));

              const aiMsg: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: "assistant",
                timestamp: "Just now",
                content: event.message || `✨ Generated ${projectName} with ${finalFlatList.length} files. Live preview and source code are ready!`,
                files: createdFiles,
              };
              setMessages((prev) => [...prev, aiMsg]);

              // Auto-save project with all generated files
              saveProject({
                id: projectId,
                name: projectName,
                files: finalFlatList,
                messages: [...messages, userMsg, aiMsg],
                activeTabId: activeTabId || finalFlatList[0]?.path || "",
                sandboxId: event.sandboxId || sandboxId,
                e2bPreviewUrl: event.previewUrl || e2bPreviewUrl,
                agentThoughts,
                terminalLogs,
              }).catch((saveErr) => console.warn("Auto-save warning:", saveErr));
            }
          } catch (jsonErr) {
            console.error("Failed to parse SSE JSON:", jsonErr);
          }
        }
      }
    } catch (err: any) {
      console.error("Generate error:", err);
      setCurrentSteps((prev) => prev.map((s) => ({ ...s, status: "completed" })));
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

  const handleInspectElement = (elementName: string, description: string) => {
    handleSendMessage(`Edit and refine the ${elementName} (${description}). Add glassmorphic styling and glowing borders.`);
  };

  // Access Denied Screen (Strict account isolation)
  if (accessDenied) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md space-y-4 rounded-2xl border border-rose-500/20 bg-card p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Private Project Access Denied</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This project is private and belongs to another account. You do not have permission to view, edit, or inspect its files.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              className="gap-2 w-full"
              onClick={() => router.push("/projects")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to My Projects</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (isLoadingProject) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-xs text-muted-foreground font-mono">Loading project {projectId}...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground animate-fade-in select-none">
      {/* Workbench Global Header */}
      <WorkbenchHeader
        currentProjectId={projectId}
        projectName={projectName}
        onProjectNameChange={(newName) => {
          setProjectName(newName);
          setHasUnsavedChanges(true);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedModel={selectedModel}
        onSelectedModelChange={setSelectedModel}
        onOpenInserter={() => setIsInserterOpen(true)}
        onOpenExportDeploy={(tab) => {
          setExportDeployDefaultTab(tab || "deploy");
          setIsExportDeployOpen(true);
        }}
        onNewProject={() => {
          const newId = `proj-${Date.now()}`;
          router.push(`/project/${newId}`);
        }}
        onOpenStitch={() => setIsStitchModalOpen(true)}
        user={user}
        onSaveProject={handleSaveProject}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSavedTime={lastSavedTime}
        onSelectProject={(id) => router.push(`/project/${id}`)}
        onDuplicateProject={handleDuplicateProject}
        filesCount={flatFiles.length}
        onDownloadZip={handleDirectDownloadZip}
      />

      {/* Mobile Tab Switcher Bar (< lg screens) */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card px-3 lg:hidden">
        <div className="grid w-full grid-cols-2 gap-1 rounded-md bg-muted/60 p-0.5 border border-border/50">
          <button
            onClick={() => setMobileTab("chat")}
            className={`flex items-center justify-center gap-1.5 rounded py-1 text-xs font-medium transition-all ${
              mobileTab === "chat"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat & Steps</span>
          </button>
          <button
            onClick={() => setMobileTab("workbench")}
            className={`flex items-center justify-center gap-1.5 rounded py-1 text-xs font-medium transition-all ${
              mobileTab === "workbench"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Workbench</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Panel Workspace Area */}
      <div className="flex flex-1 overflow-hidden select-text">
        {/* Left Panel: Chat & Activity Streamer (380px) */}
        <div
          className={`h-full w-full border-r border-border/80 lg:w-96 shrink-0 flex-col ${
            mobileTab === "chat" ? "flex" : "hidden lg:flex"
          }`}
        >
          <ChatSidebar
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            onNewChat={() => {
              const newId = `proj-${Date.now()}`;
              router.push(`/project/${newId}`);
            }}
            onResetChat={() => {
              setMessages([]);
              setFiles([]);
              setOpenTabs([]);
            }}
            onSelectFile={(filePath) => {
              const file = findFileInTree(files, filePath);
              if (file) {
                handleSelectFile(file);
              } else {
                const foundFlat = flatFiles.find((f) => f.path === filePath);
                if (foundFlat) {
                  handleSelectFile({
                    id: foundFlat.path,
                    name: foundFlat.path.split("/").pop() || foundFlat.path,
                    path: foundFlat.path,
                    type: "file",
                    content: foundFlat.content,
                  });
                }
              }
              setViewMode("code");
            }}
            onViewCode={() => setViewMode("code")}
            onDownloadZip={handleDirectDownloadZip}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            currentSteps={currentSteps}
            agentThoughts={agentThoughts}
            activeCommand={activeCommand}
          />
        </div>

        {/* Right Panel: Split Code / Preview / Mixed Workbench */}
        <div
          className={`relative h-full flex-1 flex-col overflow-hidden bg-background ${
            mobileTab === "workbench" ? "flex" : "hidden lg:flex"
          }`}
        >
          {viewMode === "preview" && (
            <div className="h-full w-full">
              <LivePreviewSandbox
                onInspectElement={handleInspectElement}
                onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
                isTerminalOpen={isTerminalOpen}
                sandboxId={sandboxId}
                initialPreviewUrl={e2bPreviewUrl}
                files={flatFiles}
                framework={framework}
                onSandboxChange={(newId, newUrl) => {
                  setSandboxId(newId);
                  setE2bPreviewUrl(newUrl);
                }}
                onViewCode={() => setViewMode("code")}
                onDownloadZip={handleDirectDownloadZip}
                onOpenMobileBuild={() => setIsMobileBuildModalOpen(true)}
              />
            </div>
          )}

          {viewMode === "code" && (
            <div className="flex h-full w-full">
              <FileTreeExplorer
                files={files}
                activeFilePath={activeTabId}
                onSelectFile={handleSelectFile}
                onDownloadZip={handleDirectDownloadZip}
              />
              <CodeEditorView
                openTabs={openTabs}
                activeTabId={activeTabId}
                onSelectTab={setActiveTabId}
                onCloseTab={handleCloseTab}
                onChangeCode={handleCodeChange}
                onDownloadZip={handleDirectDownloadZip}
              />
            </div>
          )}

          {viewMode === "split" && (
            <div className="flex h-full w-full">
              <div className="flex h-full w-1/2 border-r border-border/80">
                <FileTreeExplorer
                  files={files}
                  activeFilePath={activeTabId}
                  onSelectFile={handleSelectFile}
                  onDownloadZip={handleDirectDownloadZip}
                />
                <CodeEditorView
                  openTabs={openTabs}
                  activeTabId={activeTabId}
                  onSelectTab={setActiveTabId}
                  onCloseTab={handleCloseTab}
                  onChangeCode={handleCodeChange}
                  onDownloadZip={handleDirectDownloadZip}
                />
              </div>
              <div className="h-full w-1/2">
                <LivePreviewSandbox
                  onInspectElement={handleInspectElement}
                  onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
                  isTerminalOpen={isTerminalOpen}
                  sandboxId={sandboxId}
                  initialPreviewUrl={e2bPreviewUrl}
                  files={flatFiles}
                  framework={framework}
                  onSandboxChange={(newId, newUrl) => {
                    setSandboxId(newId);
                    setE2bPreviewUrl(newUrl);
                  }}
                  onViewCode={() => setViewMode("code")}
                  onDownloadZip={handleDirectDownloadZip}
                  onOpenMobileBuild={() => setIsMobileBuildModalOpen(true)}
                />
              </div>
            </div>
          )}

          {/* Collapsible Sandbox Terminal Drawer */}
          <TerminalDrawer
            isOpen={isTerminalOpen}
            onClose={() => setIsTerminalOpen(false)}
            onToggleMaximize={() => setIsTerminalMaximized(!isTerminalMaximized)}
            isMaximized={isTerminalMaximized}
            sandboxId={sandboxId}
            logs={terminalLogs}
          />
        </div>
      </div>

      {/* Modals */}
      <MobileAppBuildModal
        isOpen={isMobileBuildModalOpen}
        onClose={() => setIsMobileBuildModalOpen(false)}
        projectName={projectName}
        files={flatFiles}
        previewUrl={e2bPreviewUrl}
      />

      <ComponentInserterModal
        isOpen={isInserterOpen}
        onClose={() => setIsInserterOpen(false)}
        onInsert={(component) => {
          handleSendMessage(`Add the following pre-built component: ${component.name}. Description: ${component.description}`);
          setIsInserterOpen(false);
        }}
      />

      <ExportDeployModal
        isOpen={isExportDeployOpen}
        onClose={() => setIsExportDeployOpen(false)}
        defaultTab={exportDeployDefaultTab}
        files={flatFiles}
        projectName={projectName}
      />

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <StitchKeyModal
        isOpen={isStitchModalOpen}
        onClose={() => setIsStitchModalOpen(false)}
      />

      <CommandPalette />
    </div>
  );
}
