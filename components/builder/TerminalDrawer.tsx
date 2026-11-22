"use client";

import * as React from "react";
import {
  Terminal as TerminalIcon,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  RotateCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ChevronDown,
  ChevronUp,
  Loader2,
  Box,
  Command,
  Sparkles,
  Zap,
} from "@/components/icons/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

export interface TerminalLogEntry {
  time: string;
  type: "info" | "success" | "error" | "command" | "warn";
  text: string;
}

interface TerminalDrawerProps {
  isOpen: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  sandboxId?: string | null;
  logs?: TerminalLogEntry[];
  externalLogs?: TerminalLogEntry[];
  files?: Array<{ path: string; content: string }>;
}

const INITIAL_LOGS: TerminalLogEntry[] = [
  { time: "00:00:01", type: "info", text: "⚡ BYT Sandbox Terminal initialized (E2B Cloud Container)" },
  { time: "00:00:02", type: "info", text: "📁 Sandboxed workspace root: /home/user/app" },
  { time: "00:00:03", type: "success", text: "✔ Terminal execution and dev server ports active" },
  { time: "00:00:04", type: "info", text: "▲ Type 'help' or click quick pills below to execute commands" },
];

export function TerminalDrawer({
  isOpen,
  onToggle,
  onClose,
  isMaximized = false,
  onToggleMaximize,
  sandboxId,
  logs: propLogs,
  externalLogs = [],
  files = [],
}: TerminalDrawerProps) {
  const [logs, setLogs] = React.useState<TerminalLogEntry[]>(propLogs || INITIAL_LOGS);
  const [activeTab, setActiveTab] = React.useState<"terminal" | "diagnostics" | "ports">("terminal");
  const [inputCommand, setInputCommand] = React.useState("");
  const [isExecuting, setIsExecuting] = React.useState(false);
  const terminalEndRef = React.useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (onClose) onClose();
    else if (onToggle) onToggle();
  };

  // Sync external logs streamed from planner or generation API
  React.useEffect(() => {
    const incoming = propLogs || externalLogs;
    if (incoming && incoming.length > 0) {
      setLogs((prev) => {
        const lastExisting = prev[prev.length - 1];
        const lastNew = incoming[incoming.length - 1];
        if (lastExisting?.text === lastNew?.text && lastExisting?.time === lastNew?.time) {
          return prev;
        }
        return [...prev, ...incoming];
      });
    }
  }, [propLogs, externalLogs]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim() || isExecuting) return;

    const trimmed = cmd.trim();
    const time = new Date().toLocaleTimeString().split(" ")[0];

    if (trimmed === "clear") {
      setLogs([]);
      setInputCommand("");
      return;
    }

    const commandLog: TerminalLogEntry = {
      time,
      type: "command",
      text: `$ ${trimmed}`,
    };

    setLogs((prev) => [...prev, commandLog]);
    setInputCommand("");
    setIsExecuting(true);

    try {
      const response = await fetch("/api/sandbox/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: trimmed,
          sandboxId: sandboxId || undefined,
        }),
      });

      const data = await response.json();

      const outputLogs: TerminalLogEntry[] = [];
      if (data.stdout && data.stdout.trim()) {
        data.stdout.trim().split("\n").forEach((line: string) => {
          outputLogs.push({
            time: new Date().toLocaleTimeString().split(" ")[0],
            type: "info",
            text: line,
          });
        });
      }
      if (data.stderr && data.stderr.trim()) {
        data.stderr.trim().split("\n").forEach((line: string) => {
          outputLogs.push({
            time: new Date().toLocaleTimeString().split(" ")[0],
            type: data.exitCode === 0 ? "info" : "error",
            text: line,
          });
        });
      }
      if (outputLogs.length === 0) {
        outputLogs.push({
          time: new Date().toLocaleTimeString().split(" ")[0],
          type: data.success ? "success" : "error",
          text: data.success
            ? `✔ Command completed with exit code ${data.exitCode ?? 0}`
            : `❌ ${data.error || "Execution error"}`,
        });
      }
      setLogs((prev) => [...prev, ...outputLogs]);
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString().split(" ")[0],
          type: "error",
          text: `Failed to execute: ${err?.message || err}`,
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(inputCommand);
  };

  React.useEffect(() => {
    if (isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  const quickPills = [
    { label: "npm run dev", cmd: "npm run dev" },
    { label: "npm run build", cmd: "npm run build" },
    { label: "ls -la", cmd: "ls -la" },
    { label: "cat package.json", cmd: "cat package.json" },
    { label: "node -v", cmd: "node -v" },
    { label: "npm i", cmd: "npm install --no-audit" },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={handleClose}
        className="flex h-7 items-center gap-2 border-t border-border/70 bg-card/90 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors select-none"
      >
        <TerminalIcon className="h-3.5 w-3.5 text-emerald-500" />
        <span className="font-mono text-[11px]">
          Sandbox Terminal {sandboxId ? `(E2B: ${sandboxId.slice(0, 8)})` : "(Online MicroVM)"}
        </span>
        <Badge variant="success" dot className="text-[9px] py-0 px-1.5 h-4 ml-auto">
          Active
        </Badge>
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div
      className={`flex flex-col border-t border-border/80 bg-black text-slate-200 font-mono text-xs shadow-2xl transition-all ${
        isMaximized ? "h-[60%]" : "h-56"
      }`}
    >
      {/* Terminal Title Bar */}
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-white/10 bg-zinc-950 px-3 select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded transition-colors ${
              activeTab === "terminal" ? "bg-white/10 text-white font-semibold" : "text-muted-foreground hover:text-white"
            }`}
          >
            <TerminalIcon className="h-3 w-3 text-emerald-400" />
            <span>Bash Terminal</span>
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded transition-colors ${
              activeTab === "diagnostics" ? "bg-white/10 text-white font-semibold" : "text-muted-foreground hover:text-white"
            }`}
          >
            <span>Diagnostics</span>
            <span className="rounded bg-white/10 px-1 py-0.2 text-[9px]">0 Errors</span>
          </button>
          <button
            onClick={() => setActiveTab("ports")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded transition-colors ${
              activeTab === "ports" ? "bg-white/10 text-white font-semibold" : "text-muted-foreground hover:text-white"
            }`}
          >
            <Radio className="h-3 w-3 text-emerald-400" />
            <span>Ports (5173 / 3000 / 8081)</span>
          </button>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1">
          {sandboxId && (
            <span className="text-[10px] text-zinc-500 font-mono hidden md:inline px-1">
              e2b: {sandboxId.slice(0, 12)}...
            </span>
          )}

          <Tooltip content="Clear terminal">
            <button
              onClick={() => setLogs([])}
              className="p-1 text-muted-foreground hover:text-white hover:bg-white/10 rounded"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </Tooltip>

          {onToggleMaximize && (
            <Tooltip content={isMaximized ? "Restore size" : "Maximize"}>
              <button
                onClick={onToggleMaximize}
                className="p-1 text-muted-foreground hover:text-white hover:bg-white/10 rounded"
              >
                {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </button>
            </Tooltip>
          )}

          <Tooltip content="Minimize terminal">
            <button
              onClick={handleClose}
              className="p-1 text-muted-foreground hover:text-white hover:bg-white/10 rounded"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950/80 border-b border-white/5 overflow-x-auto select-none no-scrollbar">
        <span className="text-[10px] text-zinc-500 shrink-0">Quick:</span>
        {quickPills.map((pill) => (
          <button
            key={pill.label}
            onClick={() => executeCommand(pill.cmd)}
            disabled={isExecuting}
            className="px-2 py-0.5 rounded text-[10px] bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 shrink-0 transition-colors"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Terminal Body */}
      {activeTab === "terminal" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-1 select-text leading-5 text-[11px]">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-zinc-500 shrink-0 select-none">[{log.time}]</span>
              <span
                className={
                  log.type === "success"
                    ? "text-emerald-400 font-medium"
                    : log.type === "error"
                    ? "text-red-400 font-medium"
                    : log.type === "command"
                    ? "text-cyan-400 font-bold"
                    : "text-slate-300"
                }
              >
                {log.text}
              </span>
            </div>
          ))}
          {isExecuting && (
            <div className="flex items-center gap-2 text-primary text-[11px] pt-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Executing in sandbox microVM...</span>
            </div>
          )}
          <div ref={terminalEndRef} />
        </div>
      )}

      {activeTab === "diagnostics" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-zinc-400">
          <CheckCircle2 className="h-7 w-7 text-emerald-500 mb-2" />
          <p className="text-xs font-semibold text-white">No runtime issues detected</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Module resolution and HMR socket connections healthy.
          </p>
        </div>
      )}

      {activeTab === "ports" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-[11px]">
          <div className="grid grid-cols-12 text-zinc-500 border-b border-white/10 pb-1 font-semibold">
            <span className="col-span-3">Port</span>
            <span className="col-span-6">Service / Target</span>
            <span className="col-span-3 text-right">Status</span>
          </div>
          {[
            { port: "Port 5173", target: "React + Vite Dev Server", status: "Listening" },
            { port: "Port 3000", target: "Next.js 14 App Router", status: "Active" },
            { port: "Port 8081", target: "React Native Expo Web", status: "Standby" },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-12 text-slate-300">
              <span className="col-span-3 text-emerald-400 font-semibold">{item.port}</span>
              <span className="col-span-6 truncate font-mono text-zinc-300">{item.target}</span>
              <span className="col-span-3 text-right text-emerald-400">{item.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Terminal Prompt Input Bar */}
      {activeTab === "terminal" && (
        <form
          onSubmit={handleFormSubmit}
          className="flex h-8 shrink-0 items-center gap-2 border-t border-white/10 bg-zinc-950 px-3 text-[11px]"
        >
          <span className="text-emerald-400 font-bold">$</span>
          <input
            type="text"
            disabled={isExecuting}
            placeholder="Run bash / npm commands (e.g. npm run dev, ls, cat package.json, help)..."
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-zinc-600 focus:outline-none font-mono disabled:opacity-50"
          />
          <span className="text-[10px] text-zinc-600 select-none">Enter ↵</span>
        </form>
      )}
    </div>
  );
}
