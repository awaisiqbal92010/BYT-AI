"use client";

import * as React from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Code2,
  Sparkles,
  Layers,
  Globe,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

type Viewport = "desktop" | "tablet" | "mobile";
type ViewMode = "preview" | "code";

export function PreviewPanel() {
  const [viewport, setViewport] = React.useState<Viewport>("desktop");
  const [viewMode, setViewMode] = React.useState<ViewMode>("preview");
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const previewUrl = "https://preview.internal/app-v1";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const viewportWidths = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  return (
    <div className="flex h-full flex-col bg-background/50">
      {/* Top Toolbar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/80 px-3 bg-card/60 gap-2">
        {/* Left: View Mode Tabs (Preview / Code) */}
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md border border-border/50">
          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all ${
              viewMode === "preview"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => setViewMode("code")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all ${
              viewMode === "code"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Code</span>
          </button>
        </div>

        {/* Center: URL bar */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-2 bg-muted/40 border border-border/60 rounded-md px-2.5 py-1 text-xs text-muted-foreground justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Globe className="h-3 w-3 text-muted-foreground/80 shrink-0" />
            <span className="truncate font-mono text-[11px] select-all">
              {previewUrl}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip content={copied ? "Copied!" : "Copy preview URL"}>
              <button
                onClick={handleCopy}
                aria-label="Copy preview URL"
                className="text-muted-foreground hover:text-foreground p-0.5"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Right: Viewport Device Switcher & Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-muted/60 p-0.5 rounded-md border border-border/50">
            <Tooltip content="Desktop view (100%)">
              <button
                onClick={() => setViewport("desktop")}
                aria-label="Desktop viewport"
                className={`p-1.5 rounded transition-all ${
                  viewport === "desktop"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Tablet view (768px)">
              <button
                onClick={() => setViewport("tablet")}
                aria-label="Tablet viewport"
                className={`p-1.5 rounded transition-all ${
                  viewport === "tablet"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Tablet className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Mobile view (375px)">
              <button
                onClick={() => setViewport("mobile")}
                aria-label="Mobile viewport"
                className={`p-1.5 rounded transition-all ${
                  viewport === "mobile"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </div>

          <div className="h-4 w-[1px] bg-border mx-0.5 hidden sm:block" />

          <Tooltip content="Reload preview">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRefresh}
              aria-label="Reload preview"
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
              />
            </Button>
          </Tooltip>

          <Tooltip content="Open in new window">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open preview in new tab"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Main Preview / Canvas Container */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-dot-grid relative">
        <div
          className={`h-full max-h-full transition-all duration-300 ease-in-out flex flex-col ${viewportWidths[viewport]}`}
        >
          {/* IFrame Mock Frame Container */}
          <div className="flex-1 rounded-lg border border-border bg-card/90 shadow-sm flex flex-col overflow-hidden relative backdrop-blur-sm">
            {/* Mock Frame Top Bar */}
            <div className="h-8 border-b border-border/80 bg-muted/40 px-3 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-500/60" />
                <div className="h-2 w-2 rounded-full bg-amber-500/60" />
                <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground/70">
                localhost:3000
              </span>
              <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4">
                Sandbox
              </Badge>
            </div>

            {/* Frame Content / Empty State */}
            {viewMode === "preview" ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card/50">
                {/* Empty State Card */}
                <div className="max-w-md w-full rounded-xl border border-border/80 bg-background/60 p-8 shadow-sm flex flex-col items-center backdrop-blur-md">
                  <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/80 border border-border text-primary shadow-inner">
                    <Layers className="h-7 w-7 text-primary/80" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      <Sparkles className="h-2.5 w-2.5" />
                    </span>
                  </div>

                  <h3 className="text-base font-semibold tracking-tight text-foreground mb-1.5">
                    Your app preview will appear here
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-xs">
                    Send a prompt or select a suggestion on the left to start generating
                    components, full pages, or entire web applications.
                  </p>

                  <div className="grid grid-cols-2 gap-2 w-full text-left">
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 hover:border-primary/40 transition-colors">
                      <span className="text-[11px] font-medium text-foreground block">
                        ⚡ Realtime React
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Next.js App Router live compilation
                      </span>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 hover:border-primary/40 transition-colors">
                      <span className="text-[11px] font-medium text-foreground block">
                        🎨 Tailwind Engine
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Instant styling with dark mode
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated iframe placeholder container hook */}
                <div id="builder-preview-viewport" className="hidden" />
              </div>
            ) : (
              /* Code View Mode */
              <div className="flex-1 flex flex-col bg-background font-mono text-xs p-4 overflow-auto text-foreground/90 leading-relaxed">
                <div className="flex items-center justify-between pb-3 border-b border-border/60 text-muted-foreground text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-primary" />
                    <span>app/page.tsx</span>
                  </div>
                  <Badge variant="violet" className="text-[10px]">
                    TypeScript / React
                  </Badge>
                </div>
                <pre className="mt-3 text-xs text-muted-foreground leading-5 select-text overflow-x-auto">
                  <code>{`import React from "react";
import { HeroSection } from "@/components/HeroSection";
import { PricingCards } from "@/components/PricingCards";

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HeroSection 
        title="Build Web Apps at the Speed of Thought"
        subtitle="AI-driven full-stack generation with instant live preview."
      />
      <PricingCards />
    </main>
  );
}`}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
