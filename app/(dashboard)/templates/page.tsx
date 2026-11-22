"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  Eye,
  GitFork,
  Star,
  Layers,
  ArrowRight,
  Code2,
  ExternalLink,
  Laptop,
  Check,
} from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { generateProjectId } from "@/lib/project-storage";

interface Template {
  id: string;
  title: string;
  category: "SaaS & Landing" | "Dashboards" | "E-Commerce" | "Portfolios" | "AI Tools";
  description: string;
  techStack: string[];
  stars: number;
  forks: number;
  gradient: string;
  defaultPrompt: string;
  badge?: string;
}

const TEMPLATES: Template[] = [
  {
    id: "tpl-1",
    title: "SaaS Matrix Landing Page",
    category: "SaaS & Landing",
    description: "Modern dark-mode SaaS landing with interactive pricing calculator, hero glow, and feature carousel.",
    techStack: ["Next.js 14", "Tailwind", "Lucide", "Framer Motion"],
    stars: 1240,
    forks: 482,
    gradient: "from-violet-600/30 via-indigo-600/20 to-purple-900/10",
    defaultPrompt: "Build a high-conversion SaaS landing page with dark mode, interactive pricing tiers, and client testimonials.",
    badge: "Popular",
  },
  {
    id: "tpl-2",
    title: "Apex Analytics Dashboard",
    category: "Dashboards",
    description: "Enterprise executive admin panel with live data tables, revenue breakdown charts, and user filters.",
    techStack: ["Next.js 14", "Tailwind", "Recharts", "TypeScript"],
    stars: 980,
    forks: 310,
    gradient: "from-blue-600/30 via-cyan-600/20 to-sky-900/10",
    defaultPrompt: "Create a modern dark analytics admin dashboard with revenue line charts, recent transaction table, and metrics cards.",
    badge: "New",
  },
  {
    id: "tpl-3",
    title: "Verve E-Commerce Storefront",
    category: "E-Commerce",
    description: "Clean minimalist apparel and digital product store with sliding cart drawer and category filters.",
    techStack: ["Vite + React", "Tailwind", "Lucide", "Zustand"],
    stars: 754,
    forks: 245,
    gradient: "from-emerald-600/30 via-teal-600/20 to-emerald-900/10",
    defaultPrompt: "Generate a minimalist e-commerce storefront with product grid, search filtering, and interactive cart slideover.",
  },
  {
    id: "tpl-4",
    title: "Cyberfolio Developer Profile",
    category: "Portfolios",
    description: "Bento-grid portfolio with interactive tech stack pills, github activity feed, and contact modal.",
    techStack: ["Next.js 14", "Tailwind", "TypeScript"],
    stars: 1890,
    forks: 620,
    gradient: "from-amber-600/30 via-orange-600/20 to-amber-900/10",
    defaultPrompt: "Build a sleek bento-grid developer portfolio showcasing projects, interactive tech stack pills, and contact form.",
    badge: "Staff Pick",
  },
  {
    id: "tpl-5",
    title: "PromptEngine AI Chat Studio",
    category: "AI Tools",
    description: "Conversational AI playground with model switcher, prompt library drawer, and markdown syntax highlighting.",
    techStack: ["Next.js 14", "Tailwind", "Lucide", "AI SDK"],
    stars: 2150,
    forks: 890,
    gradient: "from-pink-600/30 via-purple-600/20 to-rose-900/10",
    defaultPrompt: "Build an AI chat studio UI with multi-model switcher, prompt template sidebar, and syntax highlighted code outputs.",
    badge: "Trending",
  },
  {
    id: "tpl-6",
    title: "DocsVault Documentation Hub",
    category: "SaaS & Landing",
    description: "Comprehensive developer docs portal with full-text search, code blocks with copy action, and table of contents.",
    techStack: ["Astro", "Tailwind", "MDX"],
    stars: 640,
    forks: 180,
    gradient: "from-zinc-600/30 via-neutral-600/20 to-zinc-900/10",
    defaultPrompt: "Create a modern developer documentation site with searchable sidebar, dark mode, and interactive code examples.",
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);
  const [customPrompt, setCustomPrompt] = React.useState("");

  const categories = [
    "All",
    "SaaS & Landing",
    "Dashboards",
    "E-Commerce",
    "Portfolios",
    "AI Tools",
  ];

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase()) ||
      tpl.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === "All" || tpl.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenForkModal = (tpl: Template) => {
    setSelectedTemplate(tpl);
    setCustomPrompt(tpl.defaultPrompt);
  };

  const handleForkWithAI = () => {
    if (!selectedTemplate) return;
    const newProjId = generateProjectId();
    const targetFramework = selectedTemplate.techStack.some((t) =>
      t.toLowerCase().includes("expo") || t.toLowerCase().includes("react native")
    )
      ? "React Native Expo"
      : selectedTemplate.techStack.some((t) => t.toLowerCase().includes("next"))
      ? "Next.js 14"
      : "Vite + React";
    const promptToUse = customPrompt.trim() || selectedTemplate.defaultPrompt;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "byt_pending_build",
          JSON.stringify({ prompt: promptToUse, framework: targetFramework, projectId: newProjId })
        );
      } catch (e) {
        console.warn("sessionStorage write error", e);
      }
    }
    router.push(`/apps/${newProjId}/editor/preview`);
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="violet" className="text-xs gap-1">
                <Sparkles className="h-3 w-3 text-primary" /> Template Hub
              </Badge>
              <span className="text-xs text-muted-foreground">50+ Pre-built architectures</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Kickstart with AI Templates
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Select a production-ready starter and customize it with natural language prompts.
            </p>
          </div>

          {/* Search */}
          <div className="w-full md:w-72">
            <Input
              placeholder="Search templates or tech stack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-3.5 w-3.5" />}
              clearable
              onClear={() => setSearch("")}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              hoverable
              className="flex flex-col overflow-hidden group border-border/80 hover:border-primary/50 transition-all duration-300"
            >
              {/* Visual Preview */}
              <div
                className={`h-40 w-full bg-gradient-to-br ${template.gradient} border-b border-border/60 p-5 flex flex-col justify-between relative overflow-hidden`}
              >
                <div className="flex items-center justify-between z-10">
                  <Badge variant="outline" className="text-[10px] bg-background/80 backdrop-blur-sm">
                    {template.category}
                  </Badge>
                  {template.badge && (
                    <Badge variant="violet" className="text-[10px] bg-primary/20 backdrop-blur-sm font-semibold">
                      {template.badge}
                    </Badge>
                  )}
                </div>

                {/* Center visual icon */}
                <div className="flex items-center justify-center py-2 z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/70 border border-white/10 shadow-lg text-primary group-hover:scale-110 transition-transform">
                    <Laptop className="h-6 w-6" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground z-10">
                  <div className="flex items-center gap-3 bg-background/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {template.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-3 w-3 text-primary" /> {template.forks}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                  {template.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1 leading-relaxed">
                  {template.description}
                </CardDescription>
              </CardHeader>

              {/* Tech Stack Tags */}
              <div className="px-5 py-2 flex flex-wrap gap-1.5">
                {template.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-muted/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/40"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Card Footer Actions */}
              <CardFooter className="p-5 pt-3 flex items-center justify-between border-t border-border/40 text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => handleOpenForkModal(template)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  className="h-8 text-xs gap-1.5 font-medium"
                  onClick={() => handleOpenForkModal(template)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Fork with AI</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Fork with AI Customizer Modal */}
        <Modal
          isOpen={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          title={`Fork & Customize "${selectedTemplate?.title}"`}
          description="Tailor this template with AI before launching into the interactive builder."
          maxWidth="xl"
        >
          {selectedTemplate && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Laptop className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">
                      {selectedTemplate.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {selectedTemplate.category} • {selectedTemplate.techStack.join(", ")}
                    </span>
                  </div>
                </div>
                <Badge variant="violet" className="text-[10px]">
                  Ready to Fork
                </Badge>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">
                  AI Customization Prompt
                </label>
                <textarea
                  rows={4}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe your customizations (e.g. change color palette to violet, add stripe pricing, add auth modal)..."
                  className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Quick Prompt Ideas */}
              <div>
                <span className="text-[11px] text-muted-foreground block mb-1.5">
                  💡 Popular customizations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Switch primary theme to Emerald Green",
                    "Add Stripe pricing checkout table",
                    "Include animated FAQ accordion",
                    "Add Supabase user login modal",
                  ].map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setCustomPrompt((prev) => `${prev} ${idea}`)}
                      className="rounded border border-border/70 bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      + {idea}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleForkWithAI}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Launch Custom Builder</span>
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
