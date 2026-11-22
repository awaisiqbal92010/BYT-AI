"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Plus,
  Search,
  MoreVertical,
  Rocket,
  ExternalLink,
  Copy,
  Trash2,
  Edit2,
  Layers,
  ArrowUpRight,
  Code2,
  Clock,
  Zap,
} from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { Modal } from "@/components/ui/modal";
import { ProjectCardSkeleton } from "@/components/ui/skeleton";
import {
  getSavedProjects,
  saveProject,
  deleteProject,
  duplicateProject,
  generateProjectId,
  SavedProject,
  DEFAULT_PROJECTS,
} from "@/lib/project-storage";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  framework: "Next.js 14" | "Vite + React" | "Astro" | "React SPA";
  status: "live" | "draft" | "building";
  deployUrl?: string;
  updatedAt: string;
  promptSnippet: string;
  gradient: string;
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "AI Developer Portfolio",
    slug: "ai-portfolio-builder",
    description: "Modern developer showcase with interactive project grid and dark mode.",
    framework: "Next.js 14",
    status: "live",
    deployUrl: "https://dev-portfolio.byt-ai.vercel.app",
    updatedAt: "10 mins ago",
    promptSnippet: "Build a sleek SaaS landing page for an AI developer platform...",
    gradient: "from-violet-600/20 via-indigo-600/10 to-transparent",
  },
  {
    id: "proj-2",
    name: "Nexus SaaS Landing Page",
    slug: "nexus-landing",
    description: "High-converting B2B SaaS landing page with pricing tiers and FAQ.",
    framework: "Next.js 14",
    status: "live",
    deployUrl: "https://nexus-saas.byt-ai.vercel.app",
    updatedAt: "2 hours ago",
    promptSnippet: "Create a modern dark-mode landing page with animated glass cards...",
    gradient: "from-blue-600/20 via-cyan-600/10 to-transparent",
  },
  {
    id: "proj-3",
    name: "Aura E-Commerce Store",
    slug: "aura-store",
    description: "Minimalist fashion e-commerce storefront with shopping cart & filter bar.",
    framework: "Vite + React",
    status: "draft",
    updatedAt: "Yesterday",
    promptSnippet: "Build an e-commerce catalog with grid view and slide-over cart...",
    gradient: "from-emerald-600/20 via-teal-600/10 to-transparent",
  },
  {
    id: "proj-4",
    name: "Hyperion Analytics Admin",
    slug: "hyperion-admin",
    description: "Real-time metrics dashboard with revenue charts and active user breakdown.",
    framework: "Next.js 14",
    status: "live",
    deployUrl: "https://hyperion-analytics.byt-ai.vercel.app",
    updatedAt: "3 days ago",
    promptSnippet: "Create a rich admin dashboard with metrics ribbon and revenue chart...",
    gradient: "from-amber-600/20 via-orange-600/10 to-transparent",
  },
  {
    id: "proj-5",
    name: "PromptCraft AI Prompt Studio",
    slug: "promptcraft-studio",
    description: "Community prompt playground with tag filters and one-click copy.",
    framework: "React SPA",
    status: "draft",
    updatedAt: "5 days ago",
    promptSnippet: "Build a prompt repository app with search, copy button and upvoting...",
    gradient: "from-purple-600/20 via-pink-600/10 to-transparent",
  },
  {
    id: "proj-6",
    name: "DocsFlow Documentation",
    slug: "docsflow-portal",
    description: "Starlight-inspired developer documentation with markdown preview and search.",
    framework: "Astro",
    status: "draft",
    updatedAt: "1 week ago",
    promptSnippet: "Generate a multi-page API documentation site with syntax highlighting...",
    gradient: "from-zinc-600/20 via-neutral-600/10 to-transparent",
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = React.useState<SavedProject[]>(DEFAULT_PROJECTS);
  const [search, setSearch] = React.useState("");
  const [frameworkFilter, setFrameworkFilter] = React.useState<string>("All");
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = React.useState(false);
  const [newProjectPrompt, setNewProjectPrompt] = React.useState("");
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectFramework, setNewProjectFramework] = React.useState("Next.js 14");
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshProjects = React.useCallback(async () => {
    const local = getSavedProjects();
    setProjects(local);

    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          const remoteList: SavedProject[] = data.projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            description: p.description || "",
            framework: p.framework || "Next.js 14",
            status: "live" as const,
            deployUrl: p.previewUrl || p.deployUrl,
            updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : new Date().toISOString(),
            createdAt: typeof p.createdAt === "string" ? p.createdAt : new Date().toISOString(),
            promptSnippet: p.description || "",
            gradient: "from-violet-600/20 via-indigo-600/10 to-transparent",
            files: p.files || [],
            messages: p.messages || [],
            is_public: p.isPublic ?? p.is_public,
          }));

          const merged = [...remoteList];
          for (const lp of local) {
            if (!merged.some((mp) => mp.id === lp.id)) {
              merged.push(lp);
            }
          }
          setProjects(merged);
        }
      }
    } catch {
      // offline fallback
    }
  }, []);

  React.useEffect(() => {
    refreshProjects();
    const timer = setTimeout(() => setIsLoading(false), 250);
    window.addEventListener("byt_projects_updated", refreshProjects);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("byt_projects_updated", refreshProjects);
    };
  }, [refreshProjects]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase()) ||
      project.slug.toLowerCase().includes(search.toLowerCase());
    const matchesFramework =
      frameworkFilter === "All" || project.framework === frameworkFilter;
    return matchesSearch && matchesFramework;
  });

  const handleCreateProject = async (overrideName?: string, overridePrompt?: string) => {
    const finalPrompt = (overridePrompt !== undefined ? overridePrompt : newProjectPrompt).trim();
    // Auto-derive project name from prompt if name field is empty
    const derivedName = finalPrompt
      ? finalPrompt.split(/[.!?\n]/)[0].slice(0, 40).trim() || "AI Web App"
      : "AI Web App";
    const finalName = (overrideName || newProjectName || derivedName).trim();
    if (!finalName && !finalPrompt) return;
    const newProjId = generateProjectId();
    await saveProject({
      id: newProjId,
      name: finalName,
      framework: newProjectFramework as any,
      description: finalPrompt || "AI generated web application project.",
      promptSnippet: finalPrompt || "Initial blank builder project...",
      gradient: "from-violet-600/20 via-indigo-600/10 to-transparent",
      files: [
        {
          path: "app/page.tsx",
          content: `export default function Home() {\n  return (\n    <div className="min-h-screen p-8 bg-zinc-950 text-white flex flex-col items-center justify-center">\n      <h1 className="text-4xl font-extrabold tracking-tight">${finalName}</h1>\n      <p className="mt-3 text-zinc-400 max-w-md text-center">${finalPrompt || "Built with BYT 2.0 Studio"}</p>\n    </div>\n  );\n}`,
        },
      ],
    });
    refreshProjects();
    setIsNewProjectModalOpen(false);
    setNewProjectName("");
    setNewProjectPrompt("");
    if (finalPrompt && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "byt_pending_build",
          JSON.stringify({ prompt: finalPrompt, framework: newProjectFramework, projectId: newProjId })
        );
      } catch (e) {
        console.warn("sessionStorage write error", e);
      }
    }
    router.push(`/apps/${newProjId}/editor/preview`);
  };

  const handleDuplicate = async (id: string) => {
    const dup = await duplicateProject(id);
    if (dup) refreshProjects();
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    refreshProjects();
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Top Banner / AI Creation Bar */}
        <div className="relative rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card/80 to-background p-6 md:p-8 shadow-sm overflow-hidden">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="violet" className="gap-1 px-2.5 py-0.5 text-xs">
                <Sparkles className="h-3 w-3 text-primary" /> AI Project Generator
              </Badge>
              <span className="text-xs text-muted-foreground">Phase 2 Dashboard</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              What do you want to build today?
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Describe your idea in plain English or kickstart from 50+ battle-tested templates.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <div className="relative flex-1">
                <Input
                  placeholder="e.g. Build an AI image generator app with dark mode and credits..."
                  value={newProjectPrompt}
                  onChange={(e) => setNewProjectPrompt(e.target.value)}
                  className="h-10 text-xs md:text-sm bg-background/80"
                />
              </div>
              <Button
                variant="primary"
                className="h-10 gap-1.5 px-4 font-medium"
                onClick={() => {
                  if (newProjectPrompt.trim()) {
                    handleCreateProject("AI Web App", newProjectPrompt.trim());
                  } else {
                    setIsNewProjectModalOpen(true);
                  }
                }}
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate Project</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border/70 bg-card/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Projects</span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground mt-2">{projects.length}</p>
            <span className="text-[10px] text-muted-foreground">3 updated this week</span>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">AI Generation Credits</span>
              <Zap className="h-4 w-4 text-violet-500" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground mt-2">420 <span className="text-xs font-normal text-muted-foreground">/ 500</span></p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: "84%" }} />
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Live Deployments</span>
              <Rocket className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground mt-2">3 <span className="text-xs font-normal text-emerald-500 font-medium">Active</span></p>
            <span className="text-[10px] text-muted-foreground">100% SSL protected</span>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">AI Model</span>
              <Badge variant="violet" className="text-[10px] py-0 px-1.5">Default</Badge>
            </div>
            <p className="text-sm font-semibold tracking-tight text-foreground mt-2 truncate">Claude 3.5 Sonnet</p>
            <span className="text-[10px] text-muted-foreground">Fast 200k context</span>
          </div>
        </div>

        {/* Projects Controls & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search projects by name or prompt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-3.5 w-3.5" />}
              clearable
              onClear={() => setSearch("")}
              className="w-full sm:w-72 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {["All", "Next.js 14", "Vite + React", "React SPA", "Astro"].map((framework) => (
              <button
                key={framework}
                onClick={() => setFrameworkFilter(framework)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  frameworkFilter === framework
                    ? "bg-secondary text-foreground border border-border shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {framework}
              </button>
            ))}

            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 text-xs whitespace-nowrap ml-auto"
              onClick={() => setIsNewProjectModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Project</span>
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Create Project Trigger Card */}
          <div
            onClick={() => setIsNewProjectModalOpen(true)}
            className="group flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/80 hover:border-primary/60 bg-card/30 hover:bg-card/60 p-8 text-center transition-all cursor-pointer min-h-[220px]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary border border-border group-hover:scale-110 group-hover:border-primary/40 transition-transform">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mt-3">
              Create Blank Project
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Start from scratch with AI prompts or choose a starter template.
            </p>
          </div>

          {/* Existing Project Cards */}
          {isLoading ? (
            <>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id} hoverable className="flex flex-col overflow-hidden group">
              {/* Visual Header Mockup */}
              <div className={`h-28 w-full bg-gradient-to-br ${project.gradient} border-b border-border/60 p-4 flex flex-col justify-between relative`}>
                <div className="flex items-center justify-between">
                  <Badge variant={project.status === "live" ? "success" : "secondary"} dot className="text-[10px] bg-background/80 backdrop-blur-sm">
                    {project.status === "live" ? "Live" : "Draft"}
                  </Badge>

                  <Dropdown
                    trigger={
                      <button className="flex h-6 w-6 items-center justify-center rounded bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    }
                    items={[
                      {
                        id: "open",
                        label: "Open in Builder",
                        icon: <ArrowUpRight className="h-3.5 w-3.5" />,
                        onClick: () => router.push(`/apps/${project.id}/editor/preview`),
                      },
                      {
                        id: "deploy",
                        label: "Deployments",
                        icon: <Rocket className="h-3.5 w-3.5" />,
                        onClick: () => router.push("/deployments"),
                      },
                      {
                        id: "rename",
                        label: "Rename",
                        icon: <Edit2 className="h-3.5 w-3.5" />,
                      },
                      {
                        id: "duplicate",
                        label: "Duplicate Project",
                        icon: <Copy className="h-3.5 w-3.5" />,
                        onClick: () => handleDuplicate(project.id),
                      },
                      { id: "d1", label: "", divider: true },
                      {
                        id: "delete",
                        label: "Delete Project",
                        icon: <Trash2 className="h-3.5 w-3.5" />,
                        danger: true,
                        onClick: () => handleDelete(project.id),
                      },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground bg-background/60 backdrop-blur-xs px-2 py-0.5 rounded w-fit">
                  <Code2 className="h-3 w-3 text-primary" />
                  <span>{project.framework}</span>
                </div>
              </div>

              {/* Content */}
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <Link href={`/apps/${project.id}/editor/preview`} className="hover:underline">
                    <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                  </Link>
                </div>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {project.description}
                </CardDescription>
              </CardHeader>

              {/* Prompt snippet preview */}
              <div className="px-4 py-1.5">
                <div className="rounded bg-muted/40 p-2 text-[11px] font-mono text-muted-foreground line-clamp-1 border border-border/40">
                  💬 {project.promptSnippet}
                </div>
              </div>

              {/* Footer */}
              <CardFooter className="p-4 pt-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1 text-[11px]">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  {project.deployUrl && (
                    <a
                      href={project.deployUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      title="View live site"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => router.push(`/apps/${project.id}/editor/preview`)}
                  >
                    <span>Edit</span>
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )))}
        </div>

        {/* New Project Modal */}
        <Modal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          title="Create New AI Project"
          description="Configure your project foundation and initial generation prompt."
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Project Name
              </label>
              <Input
                placeholder="e.g. SaaS Analytics Dashboard"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Framework & Stack
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Next.js 14", desc: "App Router + Tailwind" },
                  { name: "Vite + React", desc: "Fast SPA with Tailwind" },
                  { name: "Astro", desc: "Content & Documentation" },
                  { name: "React SPA", desc: "Minimal React UI" },
                ].map((fw) => (
                  <button
                    key={fw.name}
                    type="button"
                    onClick={() => setNewProjectFramework(fw.name)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      newProjectFramework === fw.name
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-xs font-semibold text-foreground block">
                      {fw.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {fw.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Initial AI Prompt (Optional)
              </label>
              <textarea
                rows={3}
                value={newProjectPrompt}
                onChange={(e) => setNewProjectPrompt(e.target.value)}
                placeholder="Describe the website, pages, theme, or components you want to generate..."
                className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNewProjectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => handleCreateProject()}
                disabled={!newProjectName.trim() && !newProjectPrompt.trim()}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Create & Launch Builder</span>
              </Button>
            </div>
          </div>
        </Modal>

        {/* Global Legal Safeguards & Zero-Liability Compliance Footer */}
        <footer className="mt-16 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">BYT AI Projects</span>
            <span>•</span>
            <span>All code created is 100% user property</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/terms" className="hover:text-primary transition-colors underline-offset-2 hover:underline">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-primary transition-colors underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-primary transition-colors underline-offset-2 hover:underline">
              Cookie Policy
            </Link>
            <span>•</span>
            <Link href="/acceptable-use" className="hover:text-primary transition-colors underline-offset-2 hover:underline">
              Acceptable Use
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
