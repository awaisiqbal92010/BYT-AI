"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  Terminal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Globe,
  Share2,
} from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getProjectById } from "@/lib/project-storage";

interface PreviewFile {
  path: string;
  content: string;
}

function StandalonePreviewContent() {
  const searchParams = useSearchParams();
  const e2bParam = searchParams?.get("e2b");
  const projectParam = searchParams?.get("project") || searchParams?.get("id");

  const [viewport, setViewport] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copiedUrl, setCopiedUrl] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [consoleOpen, setConsoleOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"in-browser" | "e2b">(e2bParam ? "e2b" : "in-browser");
  const [logs, setLogs] = React.useState<Array<{ type: string; message: string; time: string }>>([
    { type: "info", message: "⚡ BYT Sandbox Runtime initialized on current origin", time: "Just now" },
    { type: "success", message: "✔ React 18 & Tailwind CSS DOM runtime ready", time: "Just now" },
  ]);

  const [files, setFiles] = React.useState<PreviewFile[]>([]);
  const [compiledSrcDoc, setCompiledSrcDoc] = React.useState<string>("");

  React.useEffect(() => {
    if (e2bParam) {
      setMode("e2b");
    }
  }, [e2bParam]);

  React.useEffect(() => {
    // 1. Check if project ID is provided in query params
    if (projectParam) {
      const proj = getProjectById(projectParam);
      if (proj && Array.isArray(proj.files) && proj.files.length > 0) {
        setFiles(proj.files);
        return;
      }
    }

    // 2. Load generated files from localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("byt_active_preview_files");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFiles(parsed);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to load stored files for preview:", err);
      }
    }

    // Default starter preview if no files stored
    setFiles([
      {
        path: "src/App.jsx",
        content: `import React, { useState } from 'react';
import { Sparkles, Zap, Rocket, Star, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

export default function App() {
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState('features');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      {/* Header */}
      <nav className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">BYT Sandbox</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-xs text-slate-400 hover:text-white transition-colors">Documentation</button>
            <button className="text-xs text-slate-400 hover:text-white transition-colors">Components</button>
            <button className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-600/30 transition-all">
              Live Standalone
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Same-Origin In-Browser Sandbox Running</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
          Build Faster with <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">AI Intelligence</span>
        </h1>

        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          This preview runs completely on your site's URL with zero iframe blocking or cross-origin issues.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setCount((c) => c + 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all"
          >
            <span>Interactive Counter: {count}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}`,
      },
    ]);
  }, [projectParam]);

  // Compile files into standalone HTML string with Babel and React
  React.useEffect(() => {
    if (files.length === 0) return;

    const appFile =
      files.find((f) => f.path === "app/page.tsx" || f.path.endsWith("App.jsx") || f.path.endsWith("App.tsx") || f.path.endsWith("index.tsx")) ||
      files.find((f) => !f.path.includes("layout") && !f.path.includes("globals") && !f.path.endsWith(".css")) ||
      files[0];

    const componentFiles = files.filter(
      (f) => f !== appFile && !f.path.includes("layout") && (f.path.endsWith(".jsx") || f.path.endsWith(".tsx"))
    );

    const sanitizeSource = (src: string) => {
      return src
        .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, "")
        .replace(/import\s+['"][^'"]+['"];?/g, "")
        .replace(/export\s+const\s+metadata\s*=\s*\{[\s\S]*?\};?/g, "")
        .replace(/export\s+default\s+function\s+(\w+)/g, "function $1")
        .replace(/export\s+default\s+[\s\S]*?;?/g, "")
        .replace(/export\s*\{[\s\S]*?\};?/g, "")
        .replace(/export\s+function\s+/g, "function ")
        .replace(/export\s+const\s+/g, "const ")
        .replace(/export\s+let\s+/g, "let ");
    };

    const transformedCode = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script>
            if (window.Babel) {
              Babel.registerPreset('byt-preset', {
                presets: [
                  [Babel.availablePresets['react'], { runtime: 'classic' }],
                  Babel.availablePresets['typescript']
                ]
              });
            }
          </script>
          <style>
            body { margin: 0; background-color: #030712; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          <div id="root"></div>

          <script type="text/babel" data-presets="byt-preset">
            const { useState, useEffect, useRef, useMemo, useCallback } = React;

            const createIcon = (name) => function MockIcon(props) {
              return (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={props?.size || 18}
                  height={props?.size || 18}
                  viewBox="0 0 24 24"
                  fill={props?.fill || "none"}
                  stroke={props?.color || "currentColor"}
                  strokeWidth={props?.strokeWidth || 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={props?.className || "lucide"}
                >
                  <circle cx="12" cy="12" r="10" opacity="0.3" />
                  <path d="M12 6v6l4 2" />
                </svg>
              );
            };

            window.Sparkles = createIcon("Sparkles");
            window.Zap = createIcon("Zap");
            window.Rocket = createIcon("Rocket");
            window.Star = createIcon("Star");
            window.Heart = createIcon("Heart");
            window.CheckCircle2 = createIcon("CheckCircle2");
            window.ArrowRight = createIcon("ArrowRight");
            window.Code2 = createIcon("Code2");
            window.Terminal = createIcon("Terminal");
            window.Globe = createIcon("Globe");
            window.Copy = createIcon("Copy");
            window.ExternalLink = createIcon("ExternalLink");
            window.Shield = createIcon("Shield");
            window.Layers = createIcon("Layers");
            window.Send = createIcon("Send");
            window.Sliders = createIcon("Sliders");
            window.Kanban = createIcon("Kanban");
            window.Bot = createIcon("Bot");
            window.TrendingUp = createIcon("TrendingUp");
            window.ShoppingBag = createIcon("ShoppingBag");
            window.Layout = createIcon("Layout");

            try {
              ${componentFiles.map((c) => sanitizeSource(c.content)).join("\n\n")}

              // Main Application Entry
              ${sanitizeSource(appFile.content)}

              const ResolvedComponent =
                (typeof Home !== 'undefined' ? Home :
                 typeof App !== 'undefined' ? App :
                 typeof NexusLanding !== 'undefined' ? NexusLanding :
                 typeof Main !== 'undefined' ? Main :
                 typeof Portfolio !== 'undefined' ? Portfolio :
                 () => <div className="p-8 text-center text-zinc-400">Loading Application...</div>);

              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(<ResolvedComponent />);
            } catch (runtimeErr) {
              console.error("In-browser preview runtime error:", runtimeErr);
              document.getElementById('root').innerHTML = '<div style="padding: 24px; color: #f87171; font-family: monospace; font-size: 13px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; margin: 24px;">' +
                '<strong>Preview Build Note:</strong><br/>' + (runtimeErr?.message || runtimeErr) +
                '</div>';
            }
          </script>
        </body>
      </html>
    `;

    setCompiledSrcDoc(transformedCode);
  }, [files]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const doc = compiledSrcDoc;
    setCompiledSrcDoc("");
    setTimeout(() => {
      setCompiledSrcDoc(doc);
      setIsRefreshing(false);
    }, 400);
  };

  const handleCopyUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const viewportWidths = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 backdrop-blur-md z-10">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Builder</span>
          </Link>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-purple-600 flex items-center justify-center shadow-xs shadow-purple-500">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-bold text-white hidden sm:inline">
              BYT Standalone Sandbox Preview
            </span>
            <Badge variant="success" dot className="text-[10px] py-0 px-1.5 h-4">
              Live on Current URL
            </Badge>
          </div>

          {e2bParam && (
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setMode("in-browser")}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  mode === "in-browser" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                In-Browser
              </button>
              <button
                onClick={() => setMode("e2b")}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  mode === "e2b" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                E2B Cloud
              </button>
            </div>
          )}
        </div>

        {/* Center: URL display */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-400 font-mono max-w-sm w-full justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Globe className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <span className="truncate text-slate-300">
              {typeof window !== "undefined" ? window.location.href : "http://localhost:3000/preview"}
            </span>
          </div>
          <button
            onClick={handleCopyUrl}
            className="text-slate-400 hover:text-white p-0.5"
            title="Copy URL"
          >
            {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Right: Viewport Controls & Actions */}
        <div className="flex items-center gap-1.5">
          {/* Viewport Toggles */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewport("desktop")}
              className={`p-1.5 rounded transition-all ${
                viewport === "desktop" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Desktop View"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`p-1.5 rounded transition-all ${
                viewport === "tablet" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`p-1.5 rounded transition-all ${
                viewport === "mobile" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reload Preview"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-purple-400" : ""}`} />
          </button>
        </div>
      </header>

      {/* Main Preview Screen Container */}
      <main className="flex-1 overflow-auto bg-slate-900/40 p-4 flex items-center justify-center relative">
        <div className={`h-full max-h-full transition-all duration-300 ease-in-out flex flex-col ${viewportWidths[viewport]}`}>
          <div
            className={`flex-1 rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl flex flex-col overflow-hidden relative ${
              viewport === "mobile"
                ? "max-w-[375px] min-h-[640px] rounded-[32px] border-4 border-slate-800"
                : viewport === "tablet"
                ? "max-w-[768px] min-h-[580px] rounded-2xl"
                : "w-full min-h-[600px]"
            }`}
          >
            {mode === "e2b" && e2bParam ? (
              <iframe
                key={e2bParam + (isRefreshing ? "-refresh" : "")}
                src={e2bParam}
                title="E2B Live Sandbox Standalone"
                className="w-full h-full border-0 bg-slate-950"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
              />
            ) : compiledSrcDoc ? (
              <iframe
                key={compiledSrcDoc.length + (isRefreshing ? "-refresh" : "")}
                srcDoc={compiledSrcDoc}
                title="BYT In-Browser Standalone Sandbox"
                className="w-full h-full border-0 bg-slate-950"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-scripts"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400 text-sm">
                Generating preview...
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Collapsible Console Drawer */}
      <div
        className={`border-t border-slate-800 bg-slate-950 transition-all duration-300 flex flex-col ${
          consoleOpen ? "h-44" : "h-7"
        }`}
      >
        <button
          onClick={() => setConsoleOpen(!consoleOpen)}
          className="flex h-7 w-full items-center justify-between px-3 bg-slate-900/50 hover:bg-slate-900 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Terminal className="h-3 w-3 text-emerald-400" />
            <span className="font-mono font-medium">Sandbox Runtime Console</span>
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9px] text-emerald-400 font-mono">
              ● Healthy
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span>{consoleOpen ? "Hide Logs" : "Show Logs"}</span>
            {consoleOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </div>
        </button>

        {consoleOpen && (
          <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1 bg-slate-950 select-text">
            {logs.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-slate-600">[{l.time}]</span>
                <span className={l.type === "success" ? "text-emerald-400" : l.type === "error" ? "text-rose-400" : "text-blue-400"}>
                  {l.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StandalonePreviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs text-muted-foreground font-mono">Loading BYT Preview...</span>
          </div>
        </div>
      }
    >
      <StandalonePreviewContent />
    </React.Suspense>
  );
}
