"use client";

import * as React from "react";
import Link from "next/link";
import { MessageSquare, Eye, Code2, Columns } from "@/components/icons/hugeicons";
import { WorkbenchHeader, WorkbenchViewMode } from "@/components/builder/WorkbenchHeader";
import { ChatSidebar, ChatMessage } from "@/components/builder/ChatSidebar";
import { FileTreeExplorer, FileItem } from "@/components/builder/FileTreeExplorer";
import { CodeEditorView, OpenTab } from "@/components/builder/CodeEditorView";
import { LivePreviewSandbox } from "@/components/builder/LivePreviewSandbox";
import { TerminalDrawer, TerminalLogEntry } from "@/components/builder/TerminalDrawer";
import { ComponentInserterModal } from "@/components/builder/ComponentInserterModal";
import { ExportDeployModal } from "@/components/builder/ExportDeployModal";
import { CommandPalette } from "@/components/CommandPalette";
import { ExecutionStep } from "@/components/builder/ActivityStreamer";
import { IdeaPromptHero } from "@/components/builder/IdeaPromptHero";
import { WorkbenchUserData } from "@/components/builder/WorkbenchHeader";
import { createClient } from "@/lib/supabase/client";
import { AuthRequiredModal } from "@/components/builder/AuthRequiredModal";
import { StitchKeyModal } from "@/components/builder/StitchKeyModal";
import {
  SavedProject,
  getSavedProjects,
  getProjectById,
  saveProject,
  duplicateProject,
} from "@/lib/project-storage";
import { useSearchParams, useRouter } from "next/navigation";
import { MobileAppBuildModal } from "@/components/builder/MobileAppBuildModal";
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

export default function BuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Redirect ?project=xyz or ?prompt=xyz to /project/xyz
  React.useEffect(() => {
    const proj = searchParams.get("project");
    if (proj) {
      router.push(`/project/${proj}`);
      return;
    }
    const prompt = searchParams.get("prompt");
    if (prompt) {
      const newId = `proj-${Date.now()}`;
      const fw = searchParams.get("framework") || "Vite + React";
      router.push(`/project/${newId}?prompt=${encodeURIComponent(prompt)}&framework=${encodeURIComponent(fw)}`);
    }
  }, [searchParams, router]);

  const [currentProjectId, setCurrentProjectId] = React.useState<string>(() => `proj-${Date.now()}`);
  const [hasStartedProject, setHasStartedProject] = React.useState(false);
  const [projectName, setProjectName] = React.useState("My New Website");
  const [framework, setFramework] = React.useState<"Next.js 14" | "Vite + React" | "React Native Expo">("Vite + React");
  const [viewMode, setViewMode] = React.useState<WorkbenchViewMode>("preview");
  const [selectedModel, setSelectedModel] = React.useState("claude-3-7");
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

  // Sync workspace files to localStorage so standalone /preview tab has active files
  React.useEffect(() => {
    if (typeof window !== "undefined" && flatFiles.length > 0) {
      try {
        localStorage.setItem("byt_active_preview_files", JSON.stringify(flatFiles));
      } catch {}
    }
  }, [flatFiles]);

  // Load project by ID or project object
  const loadProjectData = React.useCallback((project: SavedProject) => {
    setCurrentProjectId(project.id);
    setProjectName(project.name);
    if (project.framework) {
      setFramework(project.framework as any);
    }
    setHasStartedProject(true);

    const tree = convertFlatFilesToFileTree(project.files || []);
    setFiles(tree);

    if (project.files && project.files.length > 0) {
      const defaultTabs: OpenTab[] = project.files.slice(0, 3).map((f) => ({
        id: f.path,
        name: f.path.split("/").pop() || f.path,
        path: f.path,
        content: f.content,
      }));
      setOpenTabs(defaultTabs);
      setActiveTabId(project.activeTabId || defaultTabs[0]?.path || "");
    } else {
      setOpenTabs([]);
      setActiveTabId("");
    }

    setMessages((project.messages as any) || []);
    setSandboxId(project.sandboxId || null);
    setE2bPreviewUrl(project.e2bPreviewUrl || null);
    setAgentThoughts(project.agentThoughts || []);
    setTerminalLogs(project.terminalLogs || []);
    setHasUnsavedChanges(false);
    setLastSavedTime("Just now");
  }, []);

  // Save current project state
  const handleSaveProject = React.useCallback(async () => {
    setIsSaving(true);
    try {
      await saveProject({
        id: currentProjectId,
        name: projectName,
        framework,
        files: flatFiles,
        messages: messages as any,
        activeTabId,
        sandboxId,
        e2bPreviewUrl,
        agentThoughts,
        terminalLogs,
      });
      setHasUnsavedChanges(false);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setIsSaving(false);
    }
  }, [currentProjectId, projectName, framework, flatFiles, messages, activeTabId, sandboxId, e2bPreviewUrl, agentThoughts, terminalLogs]);

  const handleSaveProjectRef = React.useRef(handleSaveProject);
  React.useEffect(() => {
    handleSaveProjectRef.current = handleSaveProject;
  }, [handleSaveProject]);

  // Check URL query param for ?project=...
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const projParam = params.get("project") || (searchParams ? searchParams.get("project") : null);
      if (projParam) {
        const found = getProjectById(projParam);
        if (found) {
          loadProjectData(found);
        }
      }
    }
  }, [searchParams, loadProjectData]);

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
            avatar_url:
              profile?.avatar_url ||
              authUser.user_metadata?.avatar_url,
            plan: profile?.plan || "free",
          });
        }
      } catch (err) {
        console.warn("Failed to load user profile in WorkbenchHeader:", err);
      }
    }

    loadUser();
  }, []);

  // Duplicate current project
  const handleDuplicateProject = async () => {
    const dup = await duplicateProject(currentProjectId);
    if (dup) {
      loadProjectData(dup);
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
      openTabs.map((tab) =>
        tab.path === activeTabId ? { ...tab, content: newCode } : tab
      )
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

    const generatedWorkspaceFiles: FileItem[] = [];

    // Get Stitch API key from localStorage if saved
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
                prev.map((s, idx) =>
                  idx === 0
                    ? { ...s, detail: event.message }
                    : s
                )
              );
            } else if (event.type === "plan") {
              if (event.plan?.projectName) {
                setProjectName(event.plan.projectName);
              }
              setCurrentSteps([
                { id: "s1", title: `✔ Architecture planned: "${event.plan?.projectName}"`, status: "completed" },
                { id: "s2", title: `⚡ Writing ${event.plan?.files?.length || 0} component files...`, status: "in_progress" },
                { id: "s3", title: "📦 Sandbox verification & live preview", status: "pending" },
              ]);
            } else if (event.type === "file") {
              const fileItem: FileItem = {
                id: event.path,
                name: event.path.split("/").pop() || event.path,
                path: event.path,
                type: "file",
                extension: (event.path.split(".").pop() as any) || "tsx",
                content: event.content,
              };

              generatedWorkspaceFiles.push(fileItem);

              // Update open tab content
              setOpenTabs((prev) => {
                const exists = prev.find((t) => t.path === event.path);
                if (exists) {
                  return prev.map((t) =>
                    t.path === event.path ? { ...t, content: event.content } : t
                  );
                }
                return [...prev, { id: event.path, name: fileItem.name, path: event.path, content: event.content }];
              });

              setActiveTabId(event.path);

              // Update root files tree
              setFiles((prev) => {
                const existing = prev.find((f) => f.path === event.path);
                if (existing) {
                  return prev.map((f) => (f.path === event.path ? fileItem : f));
                }
                return [...prev, fileItem];
              });

              setCurrentSteps((prev) =>
                prev.map((s, idx) =>
                  idx === 1
                    ? {
                        ...s,
                        detail: `Created ${event.path}`,
                        files: [...(s.files || []), event.path],
                      }
                    : s
                )
              );
            } else if (event.type === "done") {
              if (event.sandboxId) {
                setSandboxId(event.sandboxId);
              }
              if (event.previewUrl) {
                setE2bPreviewUrl(event.previewUrl);
              }

              setCurrentSteps((prev) =>
                prev.map((s) => ({ ...s, status: "completed" }))
              );

              const createdFiles = (event.files || generatedWorkspaceFiles).map((f: any) => ({
                name: f.path,
                action: "created" as const,
              }));

              const aiMsg: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: "assistant",
                timestamp: "Just now",
                content: event.message || `✨ Website generated with ${createdFiles.length} files. Live in sandbox and ready to download!`,
                files: createdFiles,
              };

              setMessages((prev) => [...prev, aiMsg]);

              // Auto-save on completion
              setTimeout(() => {
                handleSaveProjectRef.current();
              }, 1000);
            } else if (event.type === "error") {
              throw new Error(event.message || "Generation error");
            }
          } catch (pErr) {
            console.error("SSE parse error:", pErr);
          }
        }
      }
    } catch (err: any) {
      console.error("Generate error:", err);
      setCurrentSteps((prev) =>
        prev.map((s) => ({ ...s, status: "completed" }))
      );

      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: "assistant",
        timestamp: "Just now",
        content: `⚠️ Generation Note: ${err?.message || "Encountered an issue during AI synthesis."} (Please ensure OPENROUTER_API_KEY / MISTRAL_API_KEY are configured in .env.local).`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
      setActiveCommand(null);
    }
  };

  const handleStartFromHero = (prompt: string) => {
    const newId = `proj-${Date.now()}`;
    router.push(`/project/${newId}?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleNewProject = () => {
    const newId = `proj-${Date.now()}`;
    router.push(`/project/${newId}`);
  };

  const handleInspectElement = (elementName: string, description: string) => {
    handleSendMessage(`Edit and refine the ${elementName} (${description}). Add glassmorphic styling and glowing borders.`);
  };

  // If user hasn't started an idea yet, show the production IdeaPromptHero
  if (!hasStartedProject) {
    return (
      <div className="h-full w-full overflow-y-auto">
        <IdeaPromptHero
          onStartBuild={handleStartFromHero}
          isGenerating={isGenerating}
          onOpenRecentProject={(proj) => {
            router.push(`/project/${proj.id}`);
          }}
        />
        <AuthRequiredModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
        <StitchKeyModal
          isOpen={isStitchModalOpen}
          onClose={() => setIsStitchModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground animate-fade-in select-none">
      {/* Workbench Global Header */}
      <WorkbenchHeader
        currentProjectId={currentProjectId}
        projectName={projectName}
        onProjectNameChange={(newName) => {
          setProjectName(newName);
          setHasUnsavedChanges(true);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedModel={selectedModel}
        onSelectedModelChange={setSelectedModel}
        onOpenMobileBuild={() => setIsMobileBuildModalOpen(true)}
        onOpenInserter={() => setIsInserterOpen(true)}
        onOpenExportDeploy={(tab) => {
          setExportDeployDefaultTab(tab || "deploy");
          setIsExportDeployOpen(true);
        }}
        onNewProject={handleNewProject}
        onOpenStitch={() => setIsStitchModalOpen(true)}
        user={user}
        onSaveProject={handleSaveProject}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSavedTime={lastSavedTime}
        onSelectProject={(id) => {
          const found = getProjectById(id);
          if (found) loadProjectData(found);
        }}
        onDuplicateProject={handleDuplicateProject}
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
            onNewChat={handleNewProject}
            onResetChat={handleNewProject}
            onSelectFile={(filePath) => {
              const file = findFileInTree(files, filePath);
              if (file) handleSelectFile(file);
              setViewMode("code");
            }}
            selectedModel={selectedModel}
            currentSteps={currentSteps}
            agentThoughts={agentThoughts}
            activeCommand={activeCommand}
          />
        </div>

        {/* Right Panel: Dual Workbench (Preview / Code / Split) */}
        <div
          className={`h-full flex-1 flex-col overflow-hidden lg:flex ${
            mobileTab === "workbench" ? "flex" : "hidden"
          }`}
        >
          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* 1. Preview Mode */}
            {viewMode === "preview" && (
              <div className="flex-1 flex flex-col overflow-hidden">
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
                  onDownloadZip={() => downloadProjectAsZip(flatFiles, projectName, framework)}
                  onOpenMobileBuild={() => setIsMobileBuildModalOpen(true)}
                />
              </div>
            )}

            {/* 2. Code Editor Mode */}
            {viewMode === "code" && (
              <div className="flex-1 flex overflow-hidden">
                {/* File Tree Sidebar (200px) */}
                <div className="w-56 shrink-0 hidden md:block border-r border-border/70">
                  <FileTreeExplorer
                    files={files}
                    activeFilePath={activeTabId}
                    onSelectFile={handleSelectFile}
                    onCreateFile={(parentPath, fileName) => {
                      const newFile: FileItem = {
                        id: fileName,
                        name: fileName,
                        path: `${parentPath}/${fileName}`,
                        type: "file",
                        extension: "tsx",
                        content: `import * as React from "react";\n\nexport function ${fileName.replace(/\.tsx$/, "")}() {\n  return (\n    <div className="p-6 bg-card rounded-xl border">\n      <h3 className="font-bold text-sm">${fileName}</h3>\n    </div>\n  );\n}`,
                      };
                      setFiles((prev) =>
                        prev.map((f) =>
                          f.path === parentPath
                            ? { ...f, children: [...(f.children || []), newFile] }
                            : f
                        )
                      );
                      handleSelectFile(newFile);
                    }}
                  />
                </div>

                {/* Tabbed Code Editor */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <CodeEditorView
                    tabs={openTabs}
                    activeTabId={activeTabId}
                    onSelectTab={setActiveTabId}
                    onCloseTab={handleCloseTab}
                    onCodeChange={handleCodeChange}
                  />
                </div>
              </div>
            )}

            {/* 3. Side-by-Side Split Mode */}
            {viewMode === "split" && (
              <div className="flex-1 flex overflow-hidden divide-x divide-border/80">
                {/* Left Side: Code Editor */}
                <div className="flex-1 flex overflow-hidden w-1/2">
                  <div className="w-48 shrink-0 hidden xl:block border-r border-border/70">
                    <FileTreeExplorer
                      files={files}
                      activeFilePath={activeTabId}
                      onSelectFile={handleSelectFile}
                    />
                  </div>
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <CodeEditorView
                      tabs={openTabs}
                      activeTabId={activeTabId}
                      onSelectTab={setActiveTabId}
                      onCloseTab={handleCloseTab}
                      onCodeChange={handleCodeChange}
                    />
                  </div>
                </div>

                {/* Right Side: Live Interactive Preview */}
                <div className="flex-1 flex flex-col overflow-hidden w-1/2">
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
                    onDownloadZip={() => downloadProjectAsZip(flatFiles, projectName, framework)}
                    onOpenMobileBuild={() => setIsMobileBuildModalOpen(true)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Terminal Drawer */}
          <TerminalDrawer
            isOpen={isTerminalOpen}
            onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
            isMaximized={isTerminalMaximized}
            onToggleMaximize={() => setIsTerminalMaximized(!isTerminalMaximized)}
            sandboxId={sandboxId}
            externalLogs={terminalLogs}
            files={flatFiles}
          />
        </div>
      </div>

      {/* Mobile App Build Modal (APK / AAB / Expo) */}
      <MobileAppBuildModal
        isOpen={isMobileBuildModalOpen}
        onClose={() => setIsMobileBuildModalOpen(false)}
        projectName={projectName}
        files={flatFiles}
        previewUrl={e2bPreviewUrl}
      />

      {/* UI Block Inserter Modal */}
      <ComponentInserterModal
        isOpen={isInserterOpen}
        onClose={() => setIsInserterOpen(false)}
        onInsertBlock={(prompt) => handleSendMessage(prompt)}
      />

      {/* Export & Cloud Deploy Modal */}
      <ExportDeployModal
        isOpen={isExportDeployOpen}
        onClose={() => setIsExportDeployOpen(false)}
        defaultTab={exportDeployDefaultTab}
        projectName={projectName}
        files={flatFiles}
      />

      {/* Authentication Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Stitch MCP Modal */}
      <StitchKeyModal
        isOpen={isStitchModalOpen}
        onClose={() => setIsStitchModalOpen(false)}
      />

      {/* Mobile / Android App Build Modal */}
      <MobileAppBuildModal
        isOpen={isMobileBuildModalOpen}
        onClose={() => setIsMobileBuildModalOpen(false)}
        projectName={projectName}
        files={flatFiles}
        previewUrl={e2bPreviewUrl}
      />

      {/* Global Legal Safeguards & Zero-Liability Compliance Footer */}
      <footer className="shrink-0 h-7 border-t border-border/70 bg-card/90 backdrop-blur-md px-3 md:px-5 flex items-center justify-between text-[11px] text-muted-foreground select-none z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground/90 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            BYT AI
          </span>
          <span className="text-muted-foreground/60">•</span>
          <span className="hidden sm:inline text-muted-foreground/80">Full-Stack Cloud Builder</span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3.5 text-[11px]">
          <Link
            href="/terms"
            className="text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline font-medium"
          >
            Terms of Service
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline font-medium"
          >
            Privacy Policy
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link
            href="/cookies"
            className="text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline font-medium"
          >
            Cookie Policy
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link
            href="/acceptable-use"
            className="text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline font-medium"
          >
            Acceptable Use
          </Link>
          <span className="hidden lg:inline text-muted-foreground/40">•</span>
          <span className="hidden lg:inline text-[10px] text-muted-foreground/60">
            © 2026 BYT Technologies. Code generated is owned by you. DMCA & IP Protected.
          </span>
        </div>
      </footer>
    </div>
  );
}
