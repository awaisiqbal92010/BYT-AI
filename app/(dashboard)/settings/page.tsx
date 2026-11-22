"use client";

import * as React from "react";
import {
  Bot,
  Settings,
  GitBranch,
  CreditCard,
  Sparkles,
  Sliders,
  CheckCircle2,
  Database,
  Github,
  Zap,
  Trash2,
  Lock,
  ExternalLink,
  Shield,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("ai");
  const [selectedModel, setSelectedModel] = React.useState("claude-3-5");
  const [temperature, setTemperature] = React.useState(0.4);
  const [autoInstall, setAutoInstall] = React.useState(true);
  const [streaming, setStreaming] = React.useState(true);
  const [systemPrompt, setSystemPrompt] = React.useState(
    "Always use TypeScript, modern Tailwind CSS, and Lucide React icons. Prefer clean composable UI components with subtle borders and consistent rounded corners."
  );
  const [projectName, setProjectName] = React.useState("AI Developer Portfolio");
  const [projectSlug, setProjectSlug] = React.useState("ai-portfolio-builder");
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [stitchApiKey, setStitchApiKey] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setStitchApiKey(localStorage.getItem("byt_stitch_api_key") || "");
    }
  }, []);

  const tabs = [
    { id: "ai", label: "AI Engine & Rules", icon: <Bot className="h-3.5 w-3.5" /> },
    { id: "stitch", label: "Stitch MCP UI", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "general", label: "General Project", icon: <Settings className="h-3.5 w-3.5" /> },
    { id: "integrations", label: "Git & Integrations", icon: <GitBranch className="h-3.5 w-3.5" /> },
    { id: "billing", label: "Billing & Plans", icon: <CreditCard className="h-3.5 w-3.5" /> },
  ];

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const models = [
    {
      id: "claude-3-5",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      badge: "Recommended",
      description: "State-of-the-art frontend code generation, clean JSX reasoning, and design system awareness.",
      context: "200k tokens",
      speed: "Fast",
    },
    {
      id: "gpt-4o",
      name: "GPT-4o",
      provider: "OpenAI",
      description: "Strong multi-modal capabilities, versatile full-stack logic, and swift response speed.",
      context: "128k tokens",
      speed: "Ultra Fast",
    },
    {
      id: "deepseek-coder",
      name: "DeepSeek Coder V2.5",
      provider: "DeepSeek",
      badge: "Specialized",
      description: "Exceptional algorithm & TypeScript architecture generation with efficient cost footprint.",
      context: "128k tokens",
      speed: "Standard",
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="violet" className="text-xs gap-1">
                <Sliders className="h-3 w-3" /> Project Configuration
              </Badge>
              <span className="text-xs text-muted-foreground">App ID: prj_84920194</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Settings & Preferences
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Configure your default AI models, custom developer instructions, GitHub sync, and billing.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="gap-1.5 font-medium"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{savedSuccess ? "Saved Successfully!" : "Save Changes"}</span>
          </Button>
        </div>

        {/* Tab Navigation */}
        <Tabs
          items={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underlined"
        />

        {/* Tab 1: AI Engine & Rules */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            {/* Model Picker */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Default AI Generation Model
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select the primary LLM used for component synthesis, refactoring, and live generation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {models.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`rounded-lg border p-4 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedModel === model.id
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-card/60 hover:bg-card hover:border-border/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                          {model.provider}
                        </span>
                        {model.badge && (
                          <Badge variant="violet" className="text-[10px] py-0 px-1.5">
                            {model.badge}
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-foreground">
                        {model.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {model.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60 text-[10px] text-muted-foreground">
                      <span>Context: {model.context}</span>
                      <span>Speed: {model.speed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Creativity / Temperature Slider */}
            <div className="rounded-lg border border-border/80 bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Generation Creativity (Temperature: {temperature})
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Lower values produce precise, deterministic code; higher values generate creative layouts.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {temperature <= 0.3 ? "Deterministic" : temperature <= 0.7 ? "Balanced" : "Creative"}
                </Badge>
              </div>

              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>0.1 (Strict & Precise)</span>
                <span>0.5 (Standard)</span>
                <span>1.0 (Experimental)</span>
              </div>
            </div>

            {/* Custom System Prompt / Style Rules */}
            <div className="rounded-lg border border-border/80 bg-card p-5 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Custom AI Coding Directives & Style Guide
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  These instructions are automatically appended to every AI generation prompt in this project.
                </p>
              </div>

              <textarea
                rows={4}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Toggles */}
            <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                Automation Flags
              </h4>

              <div className="space-y-3 divide-y divide-border/60">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs font-medium text-foreground block">
                      Auto-install npm packages
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Automatically detect and add missing npm dependencies requested by AI code.
                    </span>
                  </div>
                  <button
                    onClick={() => setAutoInstall(!autoInstall)}
                    className={`h-5 w-9 rounded-full transition-colors p-0.5 ${
                      autoInstall ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white transition-transform ${
                        autoInstall ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="text-xs font-medium text-foreground block">
                      Stream AI token responses
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Display generated JSX & CSS code tokens in real-time as they stream.
                    </span>
                  </div>
                  <button
                    onClick={() => setStreaming(!streaming)}
                    className={`h-5 w-9 rounded-full transition-colors p-0.5 ${
                      streaming ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white transition-transform ${
                        streaming ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Stitch MCP UI Design */}
        {activeTab === "stitch" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-purple-500/30 bg-gradient-to-br from-card via-card to-purple-950/20 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="violet" className="text-xs font-semibold mb-1 gap-1">
                    <Sparkles className="h-3 w-3" /> Stitch MCP UI Engine
                  </Badge>
                  <h3 className="text-lg font-bold text-foreground">
                    AI Design System & Wireframe Synthesis
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Connect your Stitch API key to enable AI-powered design token generation and visual wireframing before code generation.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-foreground">
                  Stitch API Key
                </label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="st_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={stitchApiKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStitchApiKey(val);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("byt_stitch_api_key", val.trim());
                      }
                    }}
                    className="font-mono text-xs max-w-md"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    className="text-xs"
                  >
                    Save Key
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Your Stitch API key is stored locally in your browser and used to query design tokens directly.
                </p>
              </div>
            </div>

            {/* Stitch Design System Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Glassmorphism Tokens",
                  desc: "Generates tailored HSL surface color tokens, frosted backdrops, and glowing border radiuses.",
                },
                {
                  title: "Bento-Grid Wireframing",
                  desc: "Architects section rhythm and modular component hierarchies before React JSX generation.",
                },
                {
                  title: "Micro-Interaction Specs",
                  desc: "Injects hover glow physics, active click transitions, and interactive Lucide icons.",
                },
              ].map((card, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-2">
                  <h4 className="text-xs font-bold text-purple-400">{card.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: General Project Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Project Display Name
                </label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="max-w-md text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Project Slug
                </label>
                <Input
                  value={projectSlug}
                  onChange={(e) => setProjectSlug(e.target.value)}
                  className="max-w-md text-xs font-mono"
                />
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-5 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-red-500">
                  Danger Zone
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Deleting a project permanently destroys all historical prompt checkpoints, code files, and active deployments.
                </p>
              </div>

              <Button variant="danger" size="sm" className="gap-1.5 font-medium">
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete This Project</span>
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Git & Integrations */}
        {activeTab === "integrations" && (
          <div className="space-y-4">
            {/* GitHub Card */}
            <div className="rounded-lg border border-border/80 bg-card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                  <Github className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      GitHub Repository Sync
                    </h4>
                    <Badge variant="success" dot className="text-[10px]">
                      Connected
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Synced with <strong className="font-mono text-foreground">iqbal/ai-portfolio-builder</strong>
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" className="text-xs">
                Configure Sync
              </Button>
            </div>

            {/* Supabase Card */}
            <div className="rounded-lg border border-border/80 bg-card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      Supabase PostgreSQL & Auth
                    </h4>
                    <Badge variant="outline" className="text-[10px]">
                      Available
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    One-click database tables, row level security, and email authentication.
                  </p>
                </div>
              </div>

              <Button variant="secondary" size="sm" className="text-xs">
                Connect Database
              </Button>
            </div>
          </div>
        )}

        {/* Tab 4: Billing & Plan */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="violet" className="text-xs font-semibold mb-1">
                    PRO PLAN
                  </Badge>
                  <h3 className="text-lg font-bold text-foreground">
                    Developer Pro Subscription
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    $20 / month • Renews on September 15, 2026
                  </p>
                </div>

                <Button variant="outline" size="sm" className="text-xs">
                  Manage Subscription
                </Button>
              </div>

              {/* Usage Progress */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Monthly AI Generation Prompts</span>
                  <span className="text-foreground font-mono">420 / 500 Used (84%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "84%" }} />
                </div>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="rounded-lg border border-border/80 bg-card overflow-hidden">
              <div className="p-4 border-b border-border/80 bg-muted/30">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Recent Billing Invoices
                </h4>
              </div>
              <div className="divide-y divide-border/60 text-xs">
                {[
                  { date: "Aug 15, 2026", amount: "$20.00", status: "Paid", invoice: "INV-2026-08" },
                  { date: "Jul 15, 2026", amount: "$20.00", status: "Paid", invoice: "INV-2026-07" },
                  { date: "Jun 15, 2026", amount: "$20.00", status: "Paid", invoice: "INV-2026-06" },
                ].map((inv) => (
                  <div key={inv.invoice} className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground">{inv.invoice}</span>
                      <span className="text-muted-foreground ml-3">{inv.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-foreground">{inv.amount}</span>
                      <Badge variant="success" className="text-[10px]">{inv.status}</Badge>
                      <Button variant="ghost" size="icon-sm" aria-label="Download invoice">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
