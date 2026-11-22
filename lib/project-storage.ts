"use client";

// Project storage with local cache and Firestore API sync

export interface ProjectFile {
  path: string;
  content: string;
}

export interface SavedProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  framework: "Next.js 14" | "Vite + React" | "Astro" | "React SPA" | "React Native Expo";
  status: "live" | "draft" | "building";
  deployUrl?: string;
  updatedAt: string;
  createdAt: string;
  promptSnippet: string;
  gradient: string;
  files: ProjectFile[];
  messages: Array<{
    id: string;
    sender: "user" | "assistant" | "system";
    timestamp: string;
    content: string;
    files?: Array<{ name: string; action: "created" | "modified" | "deleted" | "updated" }>;
  }>;
  activeTabId?: string;
  sandboxId?: string | null;
  e2bPreviewUrl?: string | null;
  agentThoughts?: string[];
  terminalLogs?: Array<{ time: string; type: "command" | "info" | "error" | "success" | "warn"; text: string }>;
  is_public?: boolean;
}

const STORAGE_KEY = "byt_recent_projects_v2";

export const DEFAULT_PROJECTS: SavedProject[] = [
  {
    id: "proj-1",
    name: "AI Developer Portfolio",
    slug: "ai-developer-portfolio",
    description: "Modern developer showcase with interactive project grid, skill badges, and dark mode.",
    framework: "Next.js 14",
    status: "live",
    deployUrl: "https://dev-portfolio.byt.site",
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    promptSnippet: "Build a sleek SaaS landing page for an AI developer platform with glassmorphic cards and hero...",
    gradient: "from-violet-600/20 via-indigo-600/10 to-transparent",
    files: [
      {
        path: "app/page.tsx",
        content: `export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <header className="max-w-5xl mx-auto py-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
          Muhammad Iqbal
        </h1>
        <p className="mt-4 text-zinc-400 text-lg">Staff AI Engineer & Full-Stack Systems Architect</p>
      </header>
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-violet-400">BYT Studio 2.0</h3>
          <p className="mt-2 text-zinc-400 text-sm">Next-gen autonomous AI website builder and cloud sandbox platform.</p>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-indigo-400">MicroVM Orchestrator</h3>
          <p className="mt-2 text-zinc-400 text-sm">Ultra-low latency dev server execution in isolated cloud containers.</p>
        </div>
      </main>
    </div>
  );
}`,
      },
      {
        path: "app/layout.tsx",
        content: `import "./globals.css";

export const metadata = {
  title: "Muhammad Iqbal — Portfolio",
  description: "AI Engineer & Full-Stack Architect",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}`,
      },
    ],
    messages: [
      {
        id: "m-1",
        sender: "user",
        timestamp: "10m ago",
        content: "Build a sleek developer portfolio with dark theme, glassmorphism, and project cards.",
      },
      {
        id: "m-2",
        sender: "assistant",
        timestamp: "10m ago",
        content: "✨ Generated AI Developer Portfolio with full Next.js App Router structure and Tailwind styling.",
        files: [{ name: "app/page.tsx", action: "created" }, { name: "app/layout.tsx", action: "created" }],
      },
    ],
    activeTabId: "app/page.tsx",
  },
  {
    id: "proj-2",
    name: "Nexus SaaS Landing Page",
    slug: "nexus-saas-landing",
    description: "High-converting B2B SaaS landing page with pricing tiers, live stats, and FAQ.",
    framework: "Next.js 14",
    status: "live",
    deployUrl: "https://nexus-saas.byt.site",
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    promptSnippet: "Design an ultra-modern landing page with pricing toggle, testimonials carousel, and interactive hero...",
    gradient: "from-emerald-600/20 via-teal-600/10 to-transparent",
    files: [
      {
        path: "app/page.tsx",
        content: `export default function NexusLanding() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 px-8 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-emerald-400">Nexus AI</span>
        <button className="bg-emerald-500 text-black px-4 py-1.5 rounded-lg font-semibold text-sm">Get Started</button>
      </nav>
      <div className="max-w-4xl mx-auto text-center py-20 px-4">
        <h1 className="text-5xl font-black">Ship Software 10x Faster with Autonomous Agents</h1>
        <p className="mt-4 text-slate-400">Automate your entire deployment and testing lifecycle in one unified studio.</p>
      </div>
    </div>
  );
}`,
      },
    ],
    messages: [
      {
        id: "m-1",
        sender: "user",
        timestamp: "45m ago",
        content: "Create a SaaS landing page for Nexus AI.",
      },
      {
        id: "m-2",
        sender: "assistant",
        timestamp: "45m ago",
        content: "Created Nexus AI landing page with pricing cards and navigation.",
      },
    ],
    activeTabId: "app/page.tsx",
  },
  {
    id: "proj-3",
    name: "Crypto Analytics Hub",
    slug: "crypto-analytics-hub",
    description: "Web3 market tracker with live token price chart, swap interface, and transaction history.",
    framework: "Vite + React",
    status: "draft",
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    promptSnippet: "Build a decentralized crypto dashboard with live trading tickers, swap modal, and wallet connector...",
    gradient: "from-cyan-600/20 via-blue-600/10 to-transparent",
    files: [
      {
        path: "src/App.tsx",
        content: `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8">
      <h1 className="text-3xl font-bold text-cyan-400">Crypto Pulse Analytics</h1>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-zinc-800 rounded-xl border border-zinc-700">
          <span className="text-xs text-zinc-400">BTC / USD</span>
          <p className="text-2xl font-bold mt-1 text-emerald-400">$68,450.00 (+4.2%)</p>
        </div>
        <div className="p-4 bg-zinc-800 rounded-xl border border-zinc-700">
          <span className="text-xs text-zinc-400">ETH / USD</span>
          <p className="text-2xl font-bold mt-1 text-emerald-400">$3,520.10 (+2.8%)</p>
        </div>
        <div className="p-4 bg-zinc-800 rounded-xl border border-zinc-700">
          <span className="text-xs text-zinc-400">SOL / USD</span>
          <p className="text-2xl font-bold mt-1 text-emerald-400">$184.20 (+8.1%)</p>
        </div>
      </div>
    </div>
  );
}`,
      },
    ],
    messages: [],
    activeTabId: "src/App.tsx",
  },
];

/**
 * Retrieves all saved projects from localStorage or default seed projects
 */
export function getSavedProjects(): SavedProject[] {
  if (typeof window === "undefined") return DEFAULT_PROJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PROJECTS;
  } catch (e) {
    console.error("Error reading saved projects:", e);
    return DEFAULT_PROJECTS;
  }
}

/**
 * Retrieves a single project by ID synchronously from local cache
 */
export function getProjectById(id: string): SavedProject | null {
  const all = getSavedProjects();
  return all.find((p) => p.id === id) || null;
}

/**
 * Async fetch single project from API / Firestore first with local storage fallback
 */
export async function fetchProjectByIdAsync(id: string): Promise<SavedProject | null> {
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.project) {
        const p = data.project;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: p.description || "",
          framework: (p.framework as any) || "Next.js 14",
          status: "live",
          deployUrl: p.previewUrl || p.deployUrl,
          updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : new Date().toISOString(),
          createdAt: typeof p.createdAt === "string" ? p.createdAt : new Date().toISOString(),
          promptSnippet: p.description || "",
          gradient: "from-violet-600/20 via-indigo-600/10 to-transparent",
          files: p.files || [],
          messages: p.messages || [],
          is_public: p.isPublic ?? p.is_public,
        };
      }
    } else if (res.status === 403) {
      throw new Error("UNAUTHORIZED_ACCESS");
    }
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED_ACCESS") {
      throw e;
    }
  }

  return getProjectById(id);
}

/**
 * Saves or updates a project both in localStorage and in Firestore via /api/projects
 */
export async function saveProject(
  projectData: Partial<SavedProject> & { id: string; name: string }
): Promise<SavedProject> {
  const currentProjects = getSavedProjects();
  const existingIndex = currentProjects.findIndex((p) => p.id === projectData.id);

  const now = new Date().toISOString();

  let updatedProject: SavedProject;

  if (existingIndex >= 0) {
    const existing = currentProjects[existingIndex];
    updatedProject = {
      ...existing,
      ...projectData,
      updatedAt: now,
    };
    currentProjects[existingIndex] = updatedProject;
  } else {
    updatedProject = {
      id: projectData.id,
      name: projectData.name,
      slug: projectData.slug || projectData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: projectData.description || "AI generated web application project.",
      framework: projectData.framework || "Next.js 14",
      status: projectData.status || "draft",
      deployUrl: projectData.deployUrl,
      updatedAt: now,
      createdAt: now,
      promptSnippet: projectData.promptSnippet || projectData.description || "",
      gradient: projectData.gradient || "from-violet-600/20 via-indigo-600/10 to-transparent",
      files: projectData.files || [],
      messages: projectData.messages || [],
      activeTabId: projectData.activeTabId,
      sandboxId: projectData.sandboxId,
      e2bPreviewUrl: projectData.e2bPreviewUrl,
      agentThoughts: projectData.agentThoughts,
      terminalLogs: projectData.terminalLogs,
      is_public: projectData.is_public,
    };
    currentProjects.unshift(updatedProject);
  }

  // Save to localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProjects));
      window.dispatchEvent(new CustomEvent("byt_projects_updated", { detail: { project: updatedProject } }));
    } catch (e) {
      console.error("Failed to write project to localStorage:", e);
    }
  }

  // Sync to Firestore via /api/projects
  if (typeof window !== "undefined") {
    try {
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedProject.id,
          name: updatedProject.name,
          slug: updatedProject.slug,
          framework: updatedProject.framework,
          description: updatedProject.description,
          files: updatedProject.files,
          messages: updatedProject.messages,
          preview_url: updatedProject.e2bPreviewUrl || updatedProject.deployUrl || null,
          is_public: Boolean(updatedProject.is_public),
        }),
      }).catch(() => {});
    } catch (e) {
      // Graceful offline/local fallback
    }
  }

  return updatedProject;
}

/**
 * Deletes a project by ID from localStorage and Firestore via API
 */
export async function deleteProject(id: string): Promise<void> {
  const currentProjects = getSavedProjects();
  const nextProjects = currentProjects.filter((p) => p.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
    window.dispatchEvent(new CustomEvent("byt_projects_updated", { detail: { deletedId: id } }));
  }

  if (typeof window !== "undefined") {
    try {
      fetch(`/api/projects/${id}`, { method: "DELETE" }).catch(() => {});
    } catch (e) {
      // Ignore offline errors
    }
  }
}

/**
 * Generates a clean 24-character hexadecimal unique project ID (e.g. 6a71c49df3e1253811f86cd0)
 */
export function generateProjectId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Universal fallback: 24 hex characters
  return (
    Math.random().toString(16).substring(2, 14) +
    Math.random().toString(16).substring(2, 14)
  ).padEnd(24, "0").slice(0, 24);
}

/**
 * Returns compact, clean URL for editor preview or code view
 */
export function getAppEditorUrl(id: string, view: "preview" | "code" = "preview"): string {
  return `/apps/${id}/editor/${view}`;
}

/**
 * Duplicates a project
 */
export async function duplicateProject(id: string): Promise<SavedProject | null> {
  const source = getProjectById(id);
  if (!source) return null;

  const newId = generateProjectId();
  const newName = `${source.name} (Copy)`;

  return await saveProject({
    ...source,
    id: newId,
    name: newName,
    slug: `${source.slug}-copy`,
  });
}

