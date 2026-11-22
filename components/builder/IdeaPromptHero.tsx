"use client";

import * as React from "react";
import {
  Sparkles,
  Zap,
  ArrowRight,
  Code2,
  Layout,
  Layers,
  ShoppingBag,
  TrendingUp,
  Kanban,
  Bot,
  Shield,
  Cpu,
  Loader2,
  Terminal,
  Globe,
  Link2,
  Copy,
  CheckCircle2,
  Wand2,
  Palette,
  Database,
  BarChart3,
  Package,
  FolderGit2,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSavedProjects, SavedProject, DEFAULT_PROJECTS } from "@/lib/project-storage";

interface IdeaPromptHeroProps {
  onStartBuild: (prompt: string, framework?: "Vite + React" | "Next.js 14" | "React Native Expo") => void;
  isGenerating?: boolean;
  onOpenRecentProject?: (project: SavedProject) => void;
}

const INSPIRATION_IDEAS = [
  {
    id: "saas",
    title: "AI SaaS Landing Page",
    icon: <Sparkles className="h-4 w-4 text-violet-400" />,
    badge: "Popular",
    description: "Dark-themed SaaS landing page with interactive pricing tiers, bento feature grid, and customer testimonials.",
    prompt: "Build a modern SaaS landing page for an AI developer platform with dark mode, interactive pricing calculator with 20% annual discount, feature bento grid, and customer testimonials.",
  },
  {
    id: "portfolio",
    title: "Developer Portfolio",
    icon: <Code2 className="h-4 w-4 text-cyan-400" />,
    badge: "Essential",
    description: "Minimalist engineer portfolio with interactive project cards, skills cloud, code snippets, and contact form.",
    prompt: "Build a sleek developer portfolio with dark aesthetic, featured projects gallery with filter tags, interactive skills matrix, experience timeline, and a responsive contact modal.",
  },
  {
    id: "ecommerce",
    title: "Modern E-Commerce Store",
    icon: <ShoppingBag className="h-4 w-4 text-emerald-400" />,
    badge: "Trending",
    description: "Modern storefront with product catalog, category filters, interactive cart drawer, and checkout flow.",
    prompt: "Build a modern streetwear e-commerce store with product grid, size and color selectors, slide-over shopping cart drawer, discount code applicator, and checkout modal.",
  },
  {
    id: "crypto",
    title: "Crypto Analytics Hub",
    icon: <TrendingUp className="h-4 w-4 text-amber-400" />,
    badge: "Web3",
    description: "Financial analytics dashboard with live token price chart, swap interface, and transaction history.",
    prompt: "Build a Web3 crypto analytics dashboard with live token pricing cards, interactive chart simulation, token swap interface with slippage settings, and wallet connection modal.",
  },
  {
    id: "kanban",
    title: "Kanban Task Board",
    icon: <Kanban className="h-4 w-4 text-pink-400" />,
    badge: "Productivity",
    description: "Agile task management board with Todo, In Progress, Review, and Done columns with task creation.",
    prompt: "Build a full-featured Kanban project management board with drag-and-drop columns (Backlog, In Progress, In Review, Done), task priority tags, search filter, and task creation dialog.",
  },
  {
    id: "ai-studio",
    title: "AI Prompt Playground",
    icon: <Bot className="h-4 w-4 text-blue-400" />,
    badge: "AI Native",
    description: "LLM playground with streaming chat responses, temperature sliders, model presets, and code export.",
    prompt: "Build an AI agent playground with split-panel layout, model parameters slider (temperature, top_p), token usage metrics, chat conversation viewer, and system prompt editor.",
  },
  {
    id: "dashboard",
    title: "Analytics Dashboard",
    icon: <BarChart3 className="h-4 w-4 text-blue-400" />,
    badge: "Enterprise",
    description: "Real-time metrics dashboard with revenue charts, user analytics, and executive summary cards.",
    prompt: "Build an enterprise analytics dashboard with KPI cards, interactive revenue line chart, active users bar graph, recent transactions table, and exportable reports section.",
  },
  {
    id: "design-system",
    title: "Design System Showcase",
    icon: <Palette className="h-4 w-4 text-rose-400" />,
    badge: "UI Kit",
    description: "Interactive component library showcase with glass morphism tokens, icon browser, and code previews.",
    prompt: "Build a design system documentation site with interactive component gallery, color palette tokens, typography scale, form components, and glassmorphic card examples with dark mode toggle.",
  },
  {
    id: "saas-app",
    title: "Multi-tenant SaaS App",
    icon: <Database className="h-4 w-4 text-indigo-400" />,
    badge: "Full-Stack",
    description: "Complete SaaS application with auth, team workspaces, subscription tiers, and billing dashboard.",
    prompt: "Build a multi-tenant SaaS application shell with role-based auth login, team workspace switcher, usage credits tracker, subscription upgrade modal, and admin overview panel.",
  },
];

const CLONE_EXAMPLES = [
  "https://stripe.com",
  "https://linear.app",
  "https://vercel.com",
  "https://notion.so",
  "https://figma.com",
];

export function IdeaPromptHero({
  onStartBuild,
  isGenerating = false,
  onOpenRecentProject,
}: IdeaPromptHeroProps) {
  const [activeTab, setActiveTab] = React.useState<"build" | "clone">("build");
  const [selectedFramework, setSelectedFramework] = React.useState<"Vite + React" | "Next.js 14" | "React Native Expo">("Vite + React");
  const [promptInput, setPromptInput] = React.useState("");
  const [cloneUrl, setCloneUrl] = React.useState("");
  const [cloneStyle, setCloneStyle] = React.useState<"exact" | "inspired" | "remix">("inspired");
  const [isValidUrl, setIsValidUrl] = React.useState<boolean | null>(null);
  const [recentProjects, setRecentProjects] = React.useState<SavedProject[]>(DEFAULT_PROJECTS);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setRecentProjects(getSavedProjects());
  }, []);

  const validateUrl = (url: string) => {
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (val: string) => {
    setCloneUrl(val);
    if (val.length > 5) {
      setIsValidUrl(validateUrl(val));
    } else {
      setIsValidUrl(null);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating) return;

    if (activeTab === "build") {
      const text = (promptInput || textareaRef.current?.value || "").trim();
      if (!text) return;
      onStartBuild(text, selectedFramework);
    } else {
      const urlVal = (cloneUrl || "").trim();
      if (!urlVal) return;
      const normalizedUrl = urlVal.startsWith("http") ? urlVal : `https://${urlVal}`;
      const styleDescriptions = {
        exact: "Clone the visual design as closely as possible, replicating the layout, color palette, typography, and component structure.",
        inspired: "Take heavy design inspiration from this site but create an original modern React implementation with glassmorphism and dark mode.",
        remix: "Use this site's concept and UX patterns but completely redesign it with a fresh aesthetic, premium animations, and improved layout.",
      };
      const clonePrompt = `${styleDescriptions[cloneStyle]} The reference site is: ${normalizedUrl}. Build a full React/Next.js implementation with Tailwind CSS, including all major sections visible on the homepage.`;
      onStartBuild(clonePrompt, selectedFramework);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = (e.currentTarget.value || promptInput || textareaRef.current?.value || "").trim();
      if (text && !isGenerating) {
        onStartBuild(text, selectedFramework);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-y-auto bg-background text-foreground px-4 py-12 selection:bg-primary/20 select-none">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[600px] w-[700px] rounded-full bg-gradient-to-tr from-violet-600/15 via-indigo-600/10 to-cyan-500/10 blur-[140px]" />
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-500/5 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center space-y-8 animate-fade-in">
        {/* Header Ribbon */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-xs">
          <Zap className="h-3.5 w-3.5 fill-primary" />
          <span>BYT 2.0 • AI-Powered Full-Stack Website Engine</span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {activeTab === "clone" ? (
              <>
                Clone any{" "}
                <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                  website with AI
                </span>
              </>
            ) : (
              <>
                What do you want to{" "}
                <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                  build today?
                </span>
              </>
            )}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {activeTab === "clone"
              ? "Paste any public URL. BYT analyzes the design, recreates the layout, and builds a full React implementation."
              : "Describe your application idea in plain English. BYT plans the architecture, writes modular React & Tailwind code, and boots a live E2B cloud sandbox."}
          </p>
        </div>

        {/* Mode Tab Switcher */}
        <div className="flex rounded-xl bg-muted/50 p-1 border border-border/60 text-xs font-medium gap-1 w-full max-w-sm">
          <button
            type="button"
            onClick={() => setActiveTab("build")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              activeTab === "build"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wand2 className="h-3.5 w-3.5" />
            Build from Prompt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("clone")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              activeTab === "clone"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            Clone a Site URL
          </button>
        </div>

        {/* Main Input Box */}
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-border/90 bg-card/95 p-3 sm:p-4 shadow-2xl backdrop-blur-xl transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20"
        >
          {activeTab === "build" ? (
            <div className="flex flex-col space-y-3">
              {/* Framework Selector Pills */}
              <div className="flex items-center gap-1.5 pb-1 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">Stack:</span>
                {[
                  { id: "Vite + React", label: "⚡ React + Vite" },
                  { id: "Next.js 14", label: "▲ Next.js 14 Full-Stack" },
                  { id: "React Native Expo", label: "📱 React Native Expo" },
                ].map((fw) => (
                  <button
                    key={fw.id}
                    type="button"
                    onClick={() => setSelectedFramework(fw.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                      selectedFramework === fw.id
                        ? "bg-primary text-white shadow-xs font-semibold"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {fw.label}
                  </button>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                id="byt-prompt-input"
                name="prompt"
                aria-label="Application prompt description"
                rows={3}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onInput={(e: React.FormEvent<HTMLTextAreaElement>) => setPromptInput(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                disabled={isGenerating}
                placeholder="e.g. Build a modern crypto analytics dashboard with live token price chart, swap interface, and transaction history..."
                className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none leading-relaxed select-text"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/60 border border-border/50">
                    <Cpu className="h-3 w-3 text-emerald-500" />
                    <span className="text-foreground font-medium">Auto-Fallback Engine</span>
                    <span className="text-muted-foreground">(Mistral + Nemotron + Cohere)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">↵ Enter</kbd> to build
                  </span>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                    disabled={!promptInput.trim() || isGenerating}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <span>Build Project</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {/* URL Input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="byt-clone-url-input"
                  name="cloneUrl"
                  aria-label="Site URL to clone"
                  type="text"
                  value={cloneUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  disabled={isGenerating}
                  placeholder="https://stripe.com, https://linear.app, or any public URL..."
                  className={`w-full bg-transparent pl-9 pr-12 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none select-text border rounded-xl transition-colors ${
                    isValidUrl === true
                      ? "border-emerald-500/50"
                      : isValidUrl === false
                      ? "border-red-500/50"
                      : "border-border/60"
                  }`}
                />
                {isValidUrl === true && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                )}
              </div>

              {/* Clone Style Options */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide font-mono">
                  Clone Style:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "exact", label: "Exact Clone", desc: "Match as closely as possible", color: "text-cyan-400" },
                    { id: "inspired", label: "AI-Inspired", desc: "Take design inspiration", color: "text-violet-400" },
                    { id: "remix", label: "Remix & Elevate", desc: "Reimagine with premium UI", color: "text-pink-400" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setCloneStyle(style.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        cloneStyle === style.id
                          ? "border-primary bg-primary/10"
                          : "border-border/60 bg-muted/20 hover:border-border"
                      }`}
                    >
                      <span className={`text-xs font-bold block ${style.color}`}>{style.label}</span>
                      <span className="text-[10px] text-muted-foreground">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Examples */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-muted-foreground font-mono">Try:</span>
                {CLONE_EXAMPLES.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => handleUrlChange(url)}
                    className="text-[11px] px-2.5 py-0.5 rounded-full border border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors font-mono"
                  >
                    {url.replace("https://", "")}
                  </button>
                ))}
              </div>

              {/* Submit Row */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Link2 className="h-3 w-3" />
                  <span>AI analyzes layout, components, and design patterns</span>
                </div>
                <button
                  type="submit"
                  disabled={!cloneUrl.trim() || isGenerating || isValidUrl === false}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cloning...</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Clone Site</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Recent Projects Shelf */}
        {recentProjects.length > 0 && (
          <div className="w-full space-y-2.5 text-left animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                <FolderGit2 className="h-3.5 w-3.5 text-primary" />
                <span>Resume Recent Projects</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {recentProjects.length} saved
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {recentProjects.slice(0, 3).map((proj) => (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => {
                    if (onOpenRecentProject) {
                      onOpenRecentProject(proj);
                    }
                  }}
                  className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card/80 p-3 hover:border-primary/60 hover:bg-card hover:shadow-lg transition-all text-left cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[150px]">
                        {proj.name}
                      </span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                        {proj.framework}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {proj.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                    <span>{proj.files?.length || 0} files</span>
                    <span className="text-primary font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Open Project <ArrowRight className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick-Start Idea Suggestions — only for build mode */}
        {activeTab === "build" && (
          <div className="w-full space-y-3 text-left">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase font-mono">
                Or pick an idea template to start instantly:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {INSPIRATION_IDEAS.map((idea) => (
                <div
                  key={idea.id}
                  onClick={() => {
                    setPromptInput(idea.prompt);
                    onStartBuild(idea.prompt);
                  }}
                  className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card/70 p-3.5 hover:border-primary/50 hover:bg-card hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60 border border-border/60 group-hover:scale-105 transition-transform">
                          {idea.icon}
                        </div>
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {idea.title}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                        {idea.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {idea.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-primary font-medium pt-2 mt-2 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Build this app</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Badges Footer */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50 max-w-lg w-full text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Isolated E2B MicroVM</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>Live Public URL</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Code2 className="h-3.5 w-3.5 text-primary" />
            <span>Full React + Tailwind</span>
          </div>
        </div>
      </div>
    </div>
  );
}
