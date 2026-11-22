"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Eye,
  Code2,
  Columns,
  Download,
  Github,
  Rocket,
  Plus,
  Check,
  Edit2,
  ChevronDown,
  Zap,
  Cpu,
  User,
  CreditCard,
  Settings,
  LogOut,
  FolderKanban,
  HelpCircle,
  Save,
  Loader2,
  Clock,
  FolderGit2,
  ExternalLink,
  Copy,
  Layers,
  Smartphone,
} from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { Dropdown } from "@/components/ui/dropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { firebaseSignOut } from "@/lib/firebase";
import { getSavedProjects, SavedProject } from "@/lib/project-storage";

export type WorkbenchViewMode = "preview" | "code" | "split";

export interface WorkbenchUserData {
  id?: string;
  email?: string;
  github_username?: string;
  avatar_url?: string;
  plan?: string;
}

interface WorkbenchHeaderProps {
  currentProjectId?: string;
  projectName: string;
  onProjectNameChange: (newName: string) => void;
  viewMode: WorkbenchViewMode;
  onViewModeChange: (mode: WorkbenchViewMode) => void;
  selectedModel: string;
  onSelectedModelChange: (model: string) => void;
  framework?: string;
  onFrameworkChange?: (framework: string) => void;
  onOpenMobileBuild?: () => void;
  onOpenInserter: () => void;
  onOpenExportDeploy: (defaultTab?: "zip" | "github" | "deploy") => void;
  onOpenCommandPalette?: () => void;
  onNewProject?: () => void;
  onOpenStitch?: () => void;
  user?: WorkbenchUserData;
  onSaveProject?: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  lastSavedTime?: string | null;
  onSelectProject?: (projectId: string) => void;
  onDuplicateProject?: () => void;
  filesCount?: number;
  onDownloadZip?: () => void;
}

export function WorkbenchHeader({
  currentProjectId,
  projectName,
  onProjectNameChange,
  viewMode,
  onViewModeChange,
  selectedModel,
  onSelectedModelChange,
  framework = "Vite + React",
  onFrameworkChange,
  onOpenMobileBuild,
  onOpenInserter,
  onOpenExportDeploy,
  onOpenCommandPalette,
  onNewProject,
  onOpenStitch,
  user,
  onSaveProject,
  isSaving = false,
  hasUnsavedChanges = false,
  lastSavedTime,
  onSelectProject,
  onDuplicateProject,
  filesCount,
  onDownloadZip,
}: WorkbenchHeaderProps) {
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(projectName);
  const [recentProjects, setRecentProjects] = React.useState<SavedProject[]>([]);
  const [isProjectsMenuOpen, setIsProjectsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setTitleInput(projectName);
  }, [projectName]);

  React.useEffect(() => {
    const loadProjects = () => {
      setRecentProjects(getSavedProjects());
    };
    loadProjects();
    window.addEventListener("byt_projects_updated", loadProjects);
    return () => window.removeEventListener("byt_projects_updated", loadProjects);
  }, []);

  const displayName =
    user?.github_username || user?.email?.split("@")[0] || "Muhammad Iqbal";
  const userPlan = (user?.plan || "free").toUpperCase();

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      onProjectNameChange(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    router.push("/login");
    router.refresh();
  };

  const models = [
    { id: "claude-3-7", label: "Claude 3.7 Sonnet (Hybrid Reasoning)", badge: "New", context: "200k" },
    { id: "claude-3-5", label: "Claude 3.5 Sonnet (Default)", badge: "Recommended", context: "200k" },
    { id: "gpt-4o", label: "GPT-4o (Multimodal)", badge: "Fast", context: "128k" },
    { id: "deepseek-r1", label: "DeepSeek R1 (Coder V2.5)", badge: "Specialized", context: "128k" },
  ];

  const currentModelObj = models.find((m) => m.id === selectedModel) || models[0];

  const userMenuItems = [
    {
      id: "profile",
      label: displayName,
      icon: <User className="h-3.5 w-3.5" />,
      onClick: () => router.push("/settings"),
    },
    {
      id: "projects",
      label: `All Projects (${recentProjects.length})`,
      icon: <FolderKanban className="h-3.5 w-3.5 text-primary" />,
      onClick: () => router.push("/projects"),
    },
    {
      id: "templates",
      label: "Template Gallery",
      icon: <Layers className="h-3.5 w-3.5" />,
      onClick: () => router.push("/templates"),
    },
    {
      id: "plan",
      label: `${userPlan} Plan`,
      icon: <CreditCard className="h-3.5 w-3.5 text-primary" />,
      shortcut: userPlan,
      onClick: () => router.push("/settings"),
    },
    { id: "d1", label: "", divider: true },
    {
      id: "settings",
      label: "Studio Settings & API Keys",
      icon: <Settings className="h-3.5 w-3.5" />,
      onClick: () => router.push("/settings"),
    },
    {
      id: "legal",
      label: "Legal, Terms & Privacy",
      icon: <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />,
      onClick: () => router.push("/terms"),
    },
    { id: "d2", label: "", divider: true },
    {
      id: "logout",
      label: "Sign out",
      icon: <LogOut className="h-3.5 w-3.5" />,
      danger: true,
      onClick: handleSignOut,
    },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/80 bg-background/95 px-3 md:px-5 backdrop-blur-xl shadow-xs transition-colors select-none">
      {/* Left: Brand + Project Switcher + Title Editor */}
      <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-all">
            <Zap className="h-4 w-4 fill-white" />
          </div>
          <div className="hidden sm:flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold tracking-tight text-foreground">BYT</span>
            <span className="text-[10px] font-mono text-primary px-1.5 py-0.2 rounded-full bg-primary/10 border border-primary/20">
              2.0
            </span>
          </div>
        </Link>

        <div className="h-4 w-[1px] bg-border/80 hidden sm:block shrink-0" />

        {/* Project Switcher Dropdown */}
        <div className="relative flex items-center gap-1.5 min-w-0">
          {/* Recent Projects Selector Button */}
          <div className="relative">
            <button
              onClick={() => setIsProjectsMenuOpen(!isProjectsMenuOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/80 px-2 py-1 text-xs font-medium hover:bg-muted/70 hover:border-primary/40 transition-all shadow-2xs"
              title="Switch Recent Project"
            >
              <FolderGit2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
            </button>

            {/* Custom Recent Projects Popover */}
            {isProjectsMenuOpen && (
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsProjectsMenuOpen(false)}
              >
                <div
                  className="absolute top-12 left-16 md:left-28 z-50 w-72 md:w-80 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-2xl backdrop-blur-2xl animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Recent Projects
                    </span>
                    <button
                      onClick={() => {
                        setIsProjectsMenuOpen(false);
                        if (onNewProject) onNewProject();
                      }}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>New App</span>
                    </button>
                  </div>

                  <div className="mt-1 max-h-64 overflow-y-auto space-y-1 p-1">
                    {recentProjects.map((p) => {
                      const isCurrent = p.id === currentProjectId || p.name === projectName;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setIsProjectsMenuOpen(false);
                            if (onSelectProject) {
                              onSelectProject(p.id);
                            } else {
                              router.push(`/apps/${p.id}/editor/preview`);
                            }
                          }}
                          className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between group ${
                            isCurrent
                              ? "bg-primary/10 border border-primary/30 text-primary"
                              : "hover:bg-muted text-foreground"
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="text-xs font-bold truncate">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {p.framework} • {p.files?.length || 0} files
                            </p>
                          </div>
                          {isCurrent && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-border/60 px-2 flex justify-between">
                    <Link
                      href="/projects"
                      onClick={() => setIsProjectsMenuOpen(false)}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 py-1"
                    >
                      <FolderKanban className="h-3 w-3" />
                      <span>View All Projects</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Title Editor */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                id="header-project-name"
                name="headerProjectName"
                aria-label="Project name"
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                autoFocus
                className="h-7 rounded-lg bg-background px-2 text-xs font-semibold text-foreground border border-primary focus:outline-none ring-1 ring-primary/30"
              />
              <button
                onClick={handleTitleSubmit}
                className="p-1 text-emerald-500 hover:bg-muted rounded"
                title="Confirm Rename"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-muted/70 transition-colors text-left truncate border border-transparent hover:border-border/60"
              title="Click to rename project"
            >
              <span className="text-xs md:text-sm font-bold text-foreground truncate max-w-[120px] sm:max-w-[180px] md:max-w-[240px]">
                {projectName}
              </span>
              <Edit2 className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}

          {/* Framework and Live Status Pills */}
          <div className="hidden xl:flex items-center gap-1.5">
            <div className="flex items-center bg-muted/50 rounded-md border border-border/60 px-2 py-0.5 text-[11px] font-mono text-foreground">
              <span>{framework}</span>
            </div>

            {framework === "React Native Expo" && onOpenMobileBuild && (
              <button
                onClick={onOpenMobileBuild}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-2xs"
              >
                <span>📱 Build APK</span>
              </button>
            )}

            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>HMR Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Viewport Mode Switcher (Preview / Code / Split) */}
      <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/70 shadow-2xs">
        <Tooltip content="Live Interactive Sandbox (Hotkey: 1)">
          <button
            onClick={() => onViewModeChange("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === "preview"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </Tooltip>

        <Tooltip content="Code Editor & File Tree (Hotkey: 2)">
          <button
            onClick={() => onViewModeChange("code")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === "code"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Code</span>
            {typeof filesCount === "number" && filesCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400">
                {filesCount}
              </span>
            )}
          </button>
        </Tooltip>

        <Tooltip content="Side-by-Side Dual Workbench (Hotkey: 3)">
          <button
            onClick={() => onViewModeChange("split")}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === "split"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Columns className="h-3.5 w-3.5 text-cyan-400" />
            <span>Split</span>
          </button>
        </Tooltip>
      </div>

      {/* Right: Save Project Button, Model Selector, Actions, Deploy */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Model Selector Pill */}
        <Dropdown
          trigger={
            <button className="hidden xl:flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/60 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted hover:border-primary/40 transition-colors shadow-2xs">
              <Cpu className="h-3 w-3 text-primary" />
              <span>{currentModelObj.label.split(" ")[0]} {currentModelObj.label.split(" ")[1]}</span>
              <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
            </button>
          }
          items={models.map((m) => ({
            id: m.id,
            label: m.label,
            shortcut: m.badge,
            onClick: () => onSelectedModelChange(m.id),
          }))}
          align="right"
        />

        {/* Save Project Button */}
        {onSaveProject && (
          <Tooltip content="Save Project to Local & Cloud (Ctrl+S)">
            <button
              onClick={onSaveProject}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all shadow-2xs ${
                hasUnsavedChanges
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20"
                  : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Save className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Save</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Saved</span>
                </>
              )}
            </button>
          </Tooltip>
        )}

        {/* Stitch MCP UI Design */}
        {onOpenStitch && (
          <Tooltip content="Configure Stitch MCP AI Design Tokens">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenStitch}
              className="hidden lg:flex items-center gap-1.5 text-xs text-purple-300 bg-purple-950/40 border-purple-500/40 hover:bg-purple-900/40 h-8 px-2.5 rounded-xl shadow-2xs"
            >
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span>Stitch MCP</span>
            </Button>
          </Tooltip>
        )}

        {/* UI Blocks / Inserter Button */}
        <Tooltip content="Insert Pre-built UI Blocks">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenInserter}
            className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-xl"
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            <span>Blocks</span>
          </Button>
        </Tooltip>

        {/* Export / Download ZIP */}
        <Tooltip content="Direct Download Workspace (.zip)">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onDownloadZip) {
                onDownloadZip();
              } else {
                onOpenExportDeploy("zip");
              }
            }}
            className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary border-border/80 h-8 px-2.5 rounded-xl shadow-2xs transition-all hover:border-primary/40"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-medium">Export ZIP</span>
          </Button>
        </Tooltip>

        {/* Mobile / Android App Button */}
        {onOpenMobileBuild && (
          <Tooltip content="Build Android APK / React Native Expo App">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenMobileBuild}
              className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/30 border-emerald-500/30 hover:bg-emerald-900/40 h-8 px-2.5 rounded-xl shadow-2xs hover:border-emerald-400/50"
            >
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-medium hidden sm:inline">Build Android</span>
              <span className="font-medium sm:hidden">APK</span>
            </Button>
          </Tooltip>
        )}

        {/* GitHub Sync */}
        <Tooltip content="Push to GitHub Repository">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenExportDeploy("github")}
            className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-xl"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">GitHub</span>
          </Button>
        </Tooltip>

        {/* Deploy Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenExportDeploy("deploy")}
          className="gap-1.5 text-xs font-semibold shadow-md shadow-primary/25 h-8 px-3.5 rounded-xl"
        >
          <Rocket className="h-3.5 w-3.5" />
          <span>Deploy</span>
        </Button>

        <div className="h-4 w-[1px] bg-border mx-0.5 hidden sm:block" />

        {/* Dark/Light mode toggle */}
        <ThemeToggle />

        {/* User Profile Dropdown */}
        <Dropdown
          trigger={
            <button
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-full ml-0.5"
              aria-label="User profile menu"
            >
              <Avatar
                src={user?.avatar_url}
                fallback={displayName.slice(0, 2).toUpperCase()}
                size="sm"
                status="online"
              />
            </button>
          }
          items={userMenuItems}
          align="right"
        />
      </div>
    </header>
  );
}
