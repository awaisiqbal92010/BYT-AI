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
  Globe,
  Sparkles,
  MousePointerClick,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Layers,
  Code2,
  Send,
  Sliders,
  ChevronRight,
  Terminal as TerminalIcon,
  QrCode,
  Share2,
  Loader2,
  Box,
  Play,
  Maximize2,
  Download,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import Link from "next/link";
import { MobileAppBuildModal } from "./MobileAppBuildModal";
import { AppetizeEmulator } from "./AppetizeEmulator";

type Viewport = "desktop" | "tablet" | "mobile";

export interface LivePreviewFile {
  path: string;
  content: string;
}

interface LivePreviewSandboxProps {
  onInspectElement?: (elementName: string, description: string) => void;
  onToggleTerminal?: () => void;
  isTerminalOpen?: boolean;
  sandboxId?: string | null;
  initialPreviewUrl?: string | null;
  files?: LivePreviewFile[];
  onViewCode?: () => void;
  onDownloadZip?: () => void;
  framework?: "Next.js 14" | "Vite + React" | "React Native Expo" | string;
  projectName?: string;
  onOpenMobileBuild?: () => void;
  onSandboxChange?: (sandboxId: string, previewUrl: string) => void;
}

export function LivePreviewSandbox({
  onInspectElement,
  onToggleTerminal,
  isTerminalOpen = false,
  sandboxId: propSandboxId,
  initialPreviewUrl,
  files = [],
  onViewCode,
  onDownloadZip,
  framework = "Vite + React",
  projectName = "BYT Mobile App",
  onOpenMobileBuild,
  onSandboxChange,
}: LivePreviewSandboxProps) {
  const [viewport, setViewport] = React.useState<Viewport>(
    framework === "React Native Expo" ? "mobile" : "desktop"
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [copiedUrl, setCopiedUrl] = React.useState(false);
  const [isInspectorActive, setIsInspectorActive] = React.useState(false);
  const [mode, setMode] = React.useState<"in-browser" | "e2b">("in-browser");
  const [mobilePreviewMode, setMobilePreviewMode] = React.useState<"appetize" | "e2b">("appetize");

  // Mobile Device Frame Customization
  const [isPhoneFrameEnabled, setIsPhoneFrameEnabled] = React.useState(true);
  const [phoneOrientation, setPhoneOrientation] = React.useState<"portrait" | "landscape">("portrait");
  const [deviceTime, setDeviceTime] = React.useState("9:41");

  // E2B Real Sandbox Live State
  const [e2bPreviewUrl, setE2bPreviewUrl] = React.useState<string | null>(initialPreviewUrl || null);
  const [sandboxId, setSandboxId] = React.useState<string | null>(propSandboxId || null);
  const [isBootingSandbox, setIsBootingSandbox] = React.useState(false);
  const [sandboxError, setSandboxError] = React.useState<string | null>(null);
  const [bootStep, setBootStep] = React.useState<string>("");
  const [showQrModal, setShowQrModal] = React.useState(false);
  const [isMobileBuildModalOpen, setIsMobileBuildModalOpen] = React.useState(false);

  // Update device clock
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDeviceTime(now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // 502 Shield State
  const [isConnectingE2B, setIsConnectingE2B] = React.useState(false);
  const [isSyncingFiles, setIsSyncingFiles] = React.useState(false);

  // In-browser compiled srcDoc
  const [compiledSrcDoc, setCompiledSrcDoc] = React.useState<string>("");

  const isExpo =
    framework === "React Native Expo" ||
    files.some((f) => f.path === "app.json" || f.content?.includes("react-native"));

  React.useEffect(() => {
    if (initialPreviewUrl) {
      setE2bPreviewUrl(initialPreviewUrl);
      setMode("e2b");
    }
  }, [initialPreviewUrl]);

  React.useEffect(() => {
    if (propSandboxId) {
      setSandboxId(propSandboxId);
    }
  }, [propSandboxId]);

  // If framework is Expo, default to mobile view
  React.useEffect(() => {
    if (isExpo) {
      setViewport("mobile");
    }
  }, [isExpo]);

  // HIGH-SPEED LIVE FILE SYNC: When code is edited or streamed, push directly to microVM
  const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  React.useEffect(() => {
    if (!sandboxId || mode !== "e2b" || files.length === 0) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSyncingFiles(true);
        await fetch("/api/sandbox/sync-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sandboxId,
            files: files.slice(0, 15), // Sync active project files
          }),
        });
      } catch (err) {
        console.warn("[E2B Live Sync Error]:", err);
      } finally {
        setIsSyncingFiles(false);
      }
    }, 400);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [files, sandboxId, mode]);

  // Sync files to localStorage and compile in-browser
  React.useEffect(() => {
    if (typeof window !== "undefined" && files && files.length > 0) {
      try {
        localStorage.setItem("byt_active_preview_files", JSON.stringify(files));
      } catch (e) {
        console.warn("Storage sync warning:", e);
      }
    }

    if (!files || files.length === 0) {
      setCompiledSrcDoc("");
      return;
    }

    // Prioritize main page/app file
    const appFile =
      files.find((f) => f.path === "App.tsx" || f.path.endsWith("App.jsx") || f.path === "app/page.tsx" || f.path.endsWith("index.tsx") || f.path.endsWith("index.jsx")) ||
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

            // React Native Web Mock Primitives
            const View = ({ style, children, ...props }) => <div style={style} {...props}>{children}</div>;
            const Text = ({ style, children, ...props }) => <span style={style} {...props}>{children}</span>;
            const TouchableOpacity = ({ style, onPress, children, ...props }) => (
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', ...style }} onClick={onPress} {...props}>
                {children}
              </button>
            );
            const SafeAreaView = ({ style, children, ...props }) => <div style={{ minHeight: '100vh', ...style }} {...props}>{children}</div>;
            const ScrollView = ({ style, contentContainerStyle, children, ...props }) => (
              <div style={{ overflowY: 'auto', ...style, ...contentContainerStyle }} {...props}>{children}</div>
            );
            const StatusBar = () => null;
            const StyleSheet = { create: (styles) => styles };

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
            window.Smartphone = createIcon("Smartphone");
            window.Ionicons = createIcon("Ionicons");
            window.Feather = createIcon("Feather");

            try {
              ${componentFiles.map((c) => sanitizeSource(c.content)).join("\n\n")}

              // Main Application Entry
              ${sanitizeSource(appFile.content)}

              // Universal Root Component Resolution
              // Dynamically find the last declared component function/class
              const __BYT_COMPONENT_CANDIDATES__ = [];
              const __BYT_KNOWN_NAMES__ = [
                'Home', 'App', 'Main', 'Page', 'Root', 'Index', 'Layout',
                'NexusLanding', 'Portfolio', 'Dashboard', 'Landing',
                'Hero', 'Application', 'Container', 'Wrapper',
              ];
              for (const name of __BYT_KNOWN_NAMES__) {
                try {
                  const ref = eval(name);
                  if (typeof ref === 'function') __BYT_COMPONENT_CANDIDATES__.push(ref);
                } catch {}
              }

              // Fallback: scan window for any React-style PascalCase function
              if (__BYT_COMPONENT_CANDIDATES__.length === 0) {
                for (const key of Object.keys(window)) {
                  if (/^[A-Z][a-zA-Z0-9]+$/.test(key) && typeof window[key] === 'function') {
                    __BYT_COMPONENT_CANDIDATES__.push(window[key]);
                  }
                }
              }

              const ResolvedComponent = __BYT_COMPONENT_CANDIDATES__.length > 0
                ? __BYT_COMPONENT_CANDIDATES__[__BYT_COMPONENT_CANDIDATES__.length - 1]
                : () => <div className="p-8 text-center text-zinc-400">Loading Application...</div>;

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

    if (typeof window !== "undefined" && files && files.length > 0) {
      try {
        localStorage.setItem("byt_active_preview_files", JSON.stringify(files));
      } catch {}
    }
  }, [files]);

  // Masked Sandbox Proxy URL (hides raw *.e2b.app behind BYT domain)
  const maskedSandboxUrl = sandboxId ? `/api/sandbox/proxy/${sandboxId}` : e2bPreviewUrl;

  const standaloneUrl =
    mode === "e2b" && (maskedSandboxUrl || e2bPreviewUrl)
      ? `/preview?e2b=${encodeURIComponent(maskedSandboxUrl || e2bPreviewUrl || "")}`
      : `/preview`;

  const displayUrl =
    mode === "e2b" && sandboxId
      ? typeof window !== "undefined"
        ? `${window.location.origin}/api/sandbox/proxy/${sandboxId}`
        : `https://byt.site/api/sandbox/proxy/${sandboxId}`
      : mode === "e2b" && e2bPreviewUrl
      ? e2bPreviewUrl
      : typeof window !== "undefined"
      ? `${window.location.origin}/preview`
      : "http://localhost:3000/preview";

  const handleConnectExistingSandbox = async () => {
    if (!sandboxId) return;
    try {
      setIsBootingSandbox(true);
      setSandboxError(null);
      setBootStep(`Connecting to E2B sandbox (${sandboxId.slice(0, 8)})...`);

      const normalizedFramework =
        framework === "Next.js 14"
          ? "nextjs"
          : framework === "React Native Expo"
          ? "react-native-expo"
          : "vite-react";

      const res = await fetch("/api/sandbox/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sandboxId,
          framework: normalizedFramework,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to connect to existing sandbox");
      }

      setSandboxId(data.sandboxId);
      setE2bPreviewUrl(data.previewUrl);
      setMode("e2b");
      if (onSandboxChange) {
        onSandboxChange(data.sandboxId, data.previewUrl);
      }
    } catch (err: any) {
      console.warn("Connect to existing sandbox error:", err);
      // Fallback: launch fresh sandbox
      await handleLaunchE2BSandbox();
    } finally {
      setIsBootingSandbox(false);
      setBootStep("");
    }
  };

  const handleLaunchE2BSandbox = async () => {
    try {
      setIsBootingSandbox(true);
      setSandboxError(null);
      setBootStep(sandboxId ? `Connecting & syncing with sandbox ${sandboxId.slice(0, 8)}...` : "Allocating isolated E2B microVM...");

      const normalizedFramework =
        framework === "Next.js 14"
          ? "nextjs"
          : framework === "React Native Expo"
          ? "react-native-expo"
          : "vite-react";

      const response = await fetch("/api/sandbox/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sandboxId: sandboxId || undefined,
          files: files && files.length > 0 ? files : undefined,
          framework: normalizedFramework,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to boot E2B sandbox");
      }

      setSandboxId(data.sandboxId);
      setE2bPreviewUrl(data.previewUrl);
      setMode("e2b");
      if (onSandboxChange) {
        onSandboxChange(data.sandboxId, data.previewUrl);
      }
    } catch (err: any) {
      console.error("Failed to launch E2B sandbox:", err);
      setSandboxError(err?.message || "Failed to connect to E2B sandbox. Using instant Same-Origin in-browser preview.");
      setMode("in-browser");
    } finally {
      setIsBootingSandbox(false);
      setBootStep("");
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const viewportWidths = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    displayUrl
  )}&bgcolor=ffffff&color=09090b&margin=1`;

  return (
    <div className="flex h-full w-full flex-col bg-muted/30 select-none">
      {/* Top Browser Sandbox Bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/70 bg-card/80 px-3 gap-2 backdrop-blur-sm">
        {/* Left: Traffic Lights & Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>

          <div className="h-3.5 w-[1px] bg-border/60 mx-1" />

          {/* Mode Selector Pill */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-md border border-border/50 text-[11px]">
            <button
              onClick={() => setMode("in-browser")}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                mode === "in-browser"
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              In-Browser (Fast)
            </button>
            <button
              onClick={() => {
                if (!e2bPreviewUrl) {
                  handleLaunchE2BSandbox();
                } else {
                  setMode("e2b");
                }
              }}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                mode === "e2b"
                  ? "bg-emerald-600 text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isBootingSandbox ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> E2B Booting
                </span>
              ) : (
                "E2B MicroVM"
              )}
            </button>
          </div>

          {/* Live Syncing Badge */}
          {isSyncingFiles && (
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <RefreshCcw className="h-2.5 w-2.5 animate-spin" /> Syncing HMR
            </span>
          )}

          {/* Open in Standalone URL button */}
          <Link
            href={standaloneUrl}
            target="_blank"
            className="hidden sm:flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50 transition-colors"
            title="Open Sandbox in separate standalone page"
          >
            <Maximize2 className="h-3 w-3 text-primary" />
            <span className="text-[11px]">Standalone</span>
          </Link>
        </div>

        {/* Center: Address Bar */}
        <div className="flex items-center flex-1 max-w-sm mx-2 bg-muted/60 border border-border/70 rounded-md px-2.5 py-1 text-xs text-muted-foreground justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Globe className="h-3 w-3 text-primary shrink-0" />
            <span className="truncate font-mono text-[11px] select-all text-foreground">
              {displayUrl}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={standaloneUrl}
              target="_blank"
              className="text-muted-foreground hover:text-foreground p-0.5"
              title="Open preview"
            >
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Tooltip content={copiedUrl ? "Copied!" : "Copy URL"}>
              <button
                onClick={handleCopyUrl}
                className="text-muted-foreground hover:text-foreground p-0.5"
              >
                {copiedUrl ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Right: Viewports & Tools */}
        <div className="flex items-center gap-1">
          {/* Expo Mobile Preview Mode Switcher */}
          {isExpo && (
            <div className="flex items-center bg-muted/60 p-0.5 rounded-md border border-border/50 text-[11px] gap-0.5">
              <button
                type="button"
                onClick={() => setMobilePreviewMode("appetize")}
                className={`px-2 py-1 rounded-sm flex items-center gap-1 transition-all ${
                  mobilePreviewMode === "appetize"
                    ? "bg-emerald-600 text-white font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Launch interactive Appetize.io Android Emulator"
              >
                <Smartphone className="h-3 w-3" />
                <span>Appetize Android</span>
              </button>
              <button
                type="button"
                onClick={() => setMobilePreviewMode("e2b")}
                className={`px-2 py-1 rounded-sm flex items-center gap-1 transition-all ${
                  mobilePreviewMode === "e2b"
                    ? "bg-purple-600 text-white font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="E2B Cloud MicroVM Dev Server"
              >
                <Box className="h-3 w-3" />
                <span>E2B Cloud</span>
              </button>
            </div>
          )}

          {/* Mobile Build APK Action Button */}
          {isExpo && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (onOpenMobileBuild) onOpenMobileBuild();
                else setIsMobileBuildModalOpen(true);
              }}
              className="h-7 px-2 text-xs font-semibold gap-1 bg-purple-600 hover:bg-purple-500 text-white shadow-xs"
            >
              <Smartphone className="h-3 w-3" />
              <span>Build APK</span>
            </Button>
          )}

          {/* Viewport Toggles */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-md border border-border/50">
            <Tooltip content="Desktop (100%)">
              <button
                onClick={() => setViewport("desktop")}
                className={`p-1.5 rounded transition-all ${
                  viewport === "desktop"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Tablet (768px)">
              <button
                onClick={() => setViewport("tablet")}
                className={`p-1.5 rounded transition-all ${
                  viewport === "tablet"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Tablet className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Mobile (375px)">
              <button
                onClick={() => setViewport("mobile")}
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

          {/* Phone Frame Controls for Mobile View */}
          {(viewport === "mobile" || isExpo) && (
            <div className="flex items-center bg-muted/60 p-0.5 rounded-md border border-border/50 gap-0.5 text-[11px]">
              <Tooltip content={phoneOrientation === "portrait" ? "Switch to Landscape" : "Switch to Portrait"}>
                <button
                  onClick={() =>
                    setPhoneOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"))
                  }
                  className="px-1.5 py-1 rounded text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 font-medium text-[10px]"
                >
                  <RotateCw className="h-3 w-3" />
                  <span className="hidden sm:inline capitalize">{phoneOrientation}</span>
                </button>
              </Tooltip>
              <Tooltip content={isPhoneFrameEnabled ? "Hide Device Bezel Frame" : "Show Titanium Device Frame"}>
                <button
                  onClick={() => setIsPhoneFrameEnabled((prev) => !prev)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                    isPhoneFrameEnabled
                      ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isPhoneFrameEnabled ? "Bezel On" : "Clean"}
                </button>
              </Tooltip>
            </div>
          )}

          <div className="h-3.5 w-[1px] bg-border/60 mx-0.5 hidden sm:block" />

          {/* Refresh */}
          <Tooltip content="Reload Sandbox">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRefresh}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            </Button>
          </Tooltip>

          {/* QR Code */}
          <Tooltip content="Scan QR to Test on Phone">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowQrModal(true)}
              className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
            >
              <QrCode className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>

          {/* View Code Toggle */}
          {onViewCode && (
            <Tooltip content="Switch to Code Editor (Hotkey: 2)">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewCode}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 border-indigo-500/40 bg-indigo-950/20 hover:bg-indigo-900/40 hover:text-indigo-300 h-7 px-2.5 rounded-lg shadow-2xs transition-all"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Code</span>
              </Button>
            </Tooltip>
          )}

          {/* Direct Download ZIP */}
          {onDownloadZip && (
            <Tooltip content="Download source code (.zip)">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownloadZip}
                className="hidden sm:flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 h-7 px-2 rounded-md"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="text-[11px]">Export</span>
              </Button>
            </Tooltip>
          )}

          {/* Terminal Drawer Toggle */}
          {onToggleTerminal && (
            <Tooltip content="Toggle Sandbox Terminal">
              <Button
                variant={isTerminalOpen ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={onToggleTerminal}
                className="text-muted-foreground hover:text-foreground"
              >
                <TerminalIcon className="h-3.5 w-3.5 text-emerald-500" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Error Alert Banner */}
      {sandboxError && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-500 flex items-center justify-between">
          <span>⚠️ {sandboxError}</span>
          <button
            onClick={() => setSandboxError(null)}
            className="text-[10px] underline hover:text-amber-400"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Preview Container */}
      <div className="flex-1 overflow-auto p-3 md:p-4 flex items-start justify-center bg-dot-grid relative">
        {isExpo && mobilePreviewMode === "appetize" ? (
          <div className="w-full h-full max-w-4xl flex items-center justify-center p-2 animate-fade-in">
            <AppetizeEmulator
              projectName={projectName}
              files={files}
              defaultPlatform="android"
              onOpenQr={() => setShowQrModal(true)}
              className="w-full h-full min-h-[660px]"
            />
          </div>
        ) : (
          <div
            className={`h-full max-h-full transition-all duration-300 ease-in-out flex flex-col ${viewportWidths[viewport]}`}
          >
          {/* Mock Browser or Enhanced Smartphone Device Container */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Realistic Titanium Phone Chassis (When Mobile/Expo & Frame Enabled) */}
            {(viewport === "mobile" || isExpo) && isPhoneFrameEnabled ? (
              <div className="relative flex items-center justify-center p-3 animate-fade-in">
                {/* Physical Titanium Hardware Side Buttons */}
                {phoneOrientation === "portrait" && (
                  <>
                    {/* Left: Action Mute Button */}
                    <div className="absolute -left-[3px] top-24 w-[3.5px] h-8 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded-l-xs border-l border-white/20 shadow-sm" title="Action Button" />
                    {/* Left: Volume Up */}
                    <div className="absolute -left-[3px] top-36 w-[3.5px] h-12 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded-l-xs border-l border-white/20 shadow-sm" title="Volume Up" />
                    {/* Left: Volume Down */}
                    <div className="absolute -left-[3px] top-52 w-[3.5px] h-12 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded-l-xs border-l border-white/20 shadow-sm" title="Volume Down" />
                    {/* Right: Power / Siri Button */}
                    <div className="absolute -right-[3px] top-32 w-[3.5px] h-16 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded-r-xs border-r border-white/20 shadow-sm" title="Power Button" />
                  </>
                )}

                {/* Outer Curved Chassis with Specular Titanium Rim */}
                <div
                  className={`relative flex flex-col overflow-hidden transition-all duration-300 ${
                    phoneOrientation === "landscape"
                      ? "w-[720px] max-w-full h-[360px] rounded-[44px]"
                      : "w-[375px] max-w-full h-[690px] max-h-[calc(100vh-160px)] rounded-[52px]"
                  } p-[11px] bg-gradient-to-b from-zinc-700 via-zinc-900 to-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_50px_rgba(168,85,247,0.18)] ring-1 ring-white/20`}
                >
                  {/* Inner Screen Bezel */}
                  <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-black flex flex-col flex-1 border border-zinc-800">
                    {/* Phone Status Bar with Dynamic Island */}
                    <div className="h-8 w-full bg-black flex items-center justify-between px-6 text-[10px] text-zinc-300 font-semibold select-none shrink-0 z-30 border-b border-white/5">
                      <span className="tracking-tight text-white font-medium">{deviceTime}</span>

                      {/* Dynamic Island pill */}
                      <div className="h-5 w-24 bg-black rounded-full flex items-center justify-between px-2 shadow-inner border border-white/10 group cursor-default">
                        <div className="flex items-center gap-1.5">
                          {/* Camera lens reflection dot */}
                          <div className="h-2 w-2 rounded-full bg-zinc-900 border border-blue-500/40 flex items-center justify-center">
                            <div className="h-0.5 w-0.5 rounded-full bg-blue-400" />
                          </div>
                          {/* Audio slit */}
                          <div className="h-0.5 w-2 bg-zinc-800 rounded-full" />
                        </div>
                        {/* Ambient / FaceID sensor */}
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-900 border border-white/10" />
                      </div>

                      {/* Network & Battery Status Indicators */}
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-[9px] font-bold text-zinc-400">5G</span>
                        {/* Cellular 4-bar SVG */}
                        <svg className="w-3 h-2.5 fill-current text-white" viewBox="0 0 20 16">
                          <rect x="1" y="11" width="3" height="5" rx="1" />
                          <rect x="6" y="8" width="3" height="8" rx="1" />
                          <rect x="11" y="4" width="3" height="12" rx="1" />
                          <rect x="16" y="0" width="3" height="16" rx="1" />
                        </svg>
                        {/* Battery indicator */}
                        <div className="flex items-center">
                          <div className="w-4.5 h-2.5 border border-white/80 rounded-[3px] p-[1px] flex items-center">
                            <div className="h-full w-full bg-emerald-400 rounded-[1px]" />
                          </div>
                          <div className="w-[1px] h-1 bg-white/60 rounded-r-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Viewport Content with Diagonal Specular Glare */}
                    <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col bg-background">
                      {/* Diagonal Screen Specular Glare */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent z-20" />

                      {mode === "in-browser" && compiledSrcDoc ? (
                        <iframe
                          key={compiledSrcDoc.length + (isRefreshing ? "-refresh" : "")}
                          srcDoc={compiledSrcDoc}
                          title="BYT Same-Origin In-Browser Live Sandbox"
                          className="w-full h-full border-0 bg-slate-950 flex-1"
                          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-scripts"
                        />
                      ) : mode === "e2b" && (maskedSandboxUrl || e2bPreviewUrl) ? (
                        <iframe
                          key={(maskedSandboxUrl || e2bPreviewUrl) + (isRefreshing ? "-refresh" : "")}
                          src={maskedSandboxUrl || e2bPreviewUrl || ""}
                          title="E2B Live Cloud Sandbox Preview"
                          className="w-full h-full border-0 bg-background flex-1"
                          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
                          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                        />
                      ) : isBootingSandbox ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-6 text-center">
                          <div className="relative flex items-center justify-center">
                            <div className="h-14 w-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <Box className="h-5 w-5 text-primary absolute" />
                          </div>
                          <div className="space-y-1 max-w-xs">
                            <h3 className="text-xs font-semibold text-foreground">
                              Booting E2B MicroVM Sandbox
                            </h3>
                            <p className="text-[11px] text-muted-foreground">
                              {bootStep || "Connecting & preparing microVM..."}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="min-h-full flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-card/70 via-background to-card/70 text-foreground">
                          <div className="w-full p-5 rounded-2xl border border-border/70 bg-card/90 shadow-xl backdrop-blur-xl space-y-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold">
                              <Zap className="h-3 w-3 fill-primary" />
                              <span>{framework} Ready</span>
                            </div>

                            <div className="space-y-1">
                              <h3 className="text-base font-bold text-foreground">
                                Mobile App Standby
                              </h3>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {sandboxId
                                  ? `Connected to E2B Cloud Sandbox (${sandboxId.slice(0, 8)}). Ready to resume without wasting resources.`
                                  : "Synthesize screens via AI chat or launch the isolated cloud microVM container."}
                              </p>
                            </div>

                            <div className="pt-1 flex flex-col gap-2">
                              {sandboxId ? (
                                <button
                                  onClick={handleConnectExistingSandbox}
                                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/25 hover:bg-purple-500 active:scale-95 transition-all"
                                >
                                  <Play className="h-3 w-3 fill-current" />
                                  <span>Resume Sandbox ({sandboxId.slice(0, 8)})</span>
                                </button>
                              ) : null}
                              <button
                                onClick={handleLaunchE2BSandbox}
                                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all"
                              >
                                <Play className="h-3 w-3 fill-current" />
                                <span>{sandboxId ? "Boot New Sandbox" : "Boot E2B MicroVM"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Home Gesture Pill */}
                    <div className="h-5 w-full bg-black flex items-center justify-center shrink-0 z-30 border-t border-white/5">
                      <div className="h-1 w-28 bg-white/70 rounded-full hover:bg-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Responsive Desktop / Tablet / Clean Canvas View */
              <div
                className={`flex-1 rounded-xl border border-border/80 bg-background shadow-xl flex flex-col overflow-y-auto relative w-full ${
                  viewport === "mobile"
                    ? "max-w-[375px] min-h-[640px] rounded-2xl"
                    : viewport === "tablet"
                    ? "max-w-[768px] min-h-[580px] rounded-2xl"
                    : "w-full min-h-[600px]"
                }`}
              >
                {/* Clean Viewport Header for Mobile if frame is disabled */}
                {viewport === "mobile" && (
                  <div className="h-7 w-full bg-muted/60 border-b border-border/60 flex items-center justify-between px-4 text-[10px] text-muted-foreground font-medium select-none shrink-0">
                    <span>375 × 667 (Mobile)</span>
                    <span>Responsive Clean</span>
                  </div>
                )}

                {mode === "in-browser" && compiledSrcDoc ? (
                  <iframe
                    key={compiledSrcDoc.length + (isRefreshing ? "-refresh" : "")}
                    srcDoc={compiledSrcDoc}
                    title="BYT Same-Origin In-Browser Live Sandbox"
                    className="w-full h-full min-h-[580px] border-0 bg-slate-950 flex-1"
                    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-scripts"
                  />
                ) : mode === "e2b" && (maskedSandboxUrl || e2bPreviewUrl) ? (
                  <iframe
                    key={(maskedSandboxUrl || e2bPreviewUrl) + (isRefreshing ? "-refresh" : "")}
                    src={maskedSandboxUrl || e2bPreviewUrl || ""}
                    title="E2B Live Cloud Sandbox Preview"
                    className="w-full h-full min-h-[580px] border-0 bg-background flex-1"
                    allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
                    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                  />
                ) : isBootingSandbox ? (
                  <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4 p-8 text-center">
                    <div className="relative flex items-center justify-center">
                      <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <Box className="h-6 w-6 text-primary absolute" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h3 className="text-sm font-semibold text-foreground">
                        Booting E2B MicroVM Sandbox
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {bootStep || "Writing project files and launching dev server on port..."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-full flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-card/50 via-background to-card/50 text-foreground">
                    <div className="max-w-md w-full p-8 rounded-2xl border border-border/80 bg-card/80 shadow-2xl backdrop-blur-xl space-y-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                        <Zap className="h-3.5 w-3.5 fill-primary" />
                        <span>{framework} Ready to Run</span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground">
                          Live Sandbox Standby
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {sandboxId
                            ? `This project has an active E2B microVM (${sandboxId.slice(0, 8)}). Reconnect to preserve all memory and state.`
                            : "Prompt the AI in the chat to synthesize your layout, or boot the cloud microVM container directly."}
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2">
                        {sandboxId ? (
                          <button
                            onClick={handleConnectExistingSandbox}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-purple-600/25 hover:bg-purple-500 active:scale-95 transition-all"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>Resume ({sandboxId.slice(0, 8)})</span>
                          </button>
                        ) : null}
                        <button
                          onClick={handleLaunchE2BSandbox}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>{sandboxId ? "New Sandbox" : "Boot E2B MicroVM"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* QR Code Modal for Phone Testing */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="max-w-xs w-full rounded-2xl border border-border bg-card p-5 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-primary" />
                <span>Test Live on Phone</span>
              </h4>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center p-3 bg-white rounded-xl shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSvgUrl} alt="Scan QR Code" className="h-40 w-40 object-contain" />
            </div>
            <p className="text-xs text-muted-foreground">
              Point your phone camera to open the live preview or download the APK installer directly.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs font-semibold"
              onClick={() => setShowQrModal(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Build APK / AAB Modal */}
      <MobileAppBuildModal
        isOpen={isMobileBuildModalOpen}
        onClose={() => setIsMobileBuildModalOpen(false)}
        projectName={files[0]?.path?.split("/")[0] || "BYT Mobile App"}
        files={files}
        previewUrl={displayUrl}
      />
    </div>
  );
}
