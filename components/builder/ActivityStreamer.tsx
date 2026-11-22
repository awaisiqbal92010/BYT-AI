"use client";

import * as React from "react";
import {
  Terminal,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Zap,
  Brain,
  Sparkles,
  Command,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ExecutionStep {
  id: string;
  title: string;
  status: "completed" | "in_progress" | "pending";
  detail?: string;
  files?: string[];
  logs?: string[];
}

interface ActivityStreamerProps {
  steps: ExecutionStep[];
  isGenerating: boolean;
  onViewDiff?: (file: string) => void;
  agentThoughts?: string[];
  activeCommand?: string | null;
}

export function ActivityStreamer({
  steps,
  isGenerating,
  onViewDiff,
  agentThoughts = [],
  activeCommand,
}: ActivityStreamerProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isThinkingExpanded, setIsThinkingExpanded] = React.useState(true);
  const [activeLogTab, setActiveLogTab] = React.useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

  // Timer while generating
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating) {
      setElapsedSeconds(0);
      timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const currentStep = steps.find((s) => s.status === "in_progress") || steps[steps.length - 1];

  return (
    <div className="rounded-xl border border-border/80 bg-card/85 backdrop-blur-md overflow-hidden shadow-sm transition-all space-y-2 p-2">
      {/* 1. AGENT THINKING & REASONING PANEL */}
      {(isGenerating || agentThoughts.length > 0) && (
        <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 overflow-hidden shadow-xs">
          <div
            onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
            className="flex items-center justify-between px-3 py-2 bg-purple-900/20 hover:bg-purple-900/30 cursor-pointer transition-colors border-b border-purple-500/20 select-none"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/20 text-purple-400">
                <Brain className={`h-3.5 w-3.5 ${isGenerating ? "animate-pulse text-purple-300" : ""}`} />
              </div>
              <span className="text-xs font-bold text-purple-300">
                Agent Thinking & Strategy
              </span>
              {isGenerating && (
                <span className="flex items-center gap-1 text-[10px] text-purple-400 font-mono">
                  <Clock className="h-2.5 w-2.5" />
                  {elapsedSeconds}s
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-purple-400 text-xs">
              <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded font-mono">
                {agentThoughts.length} Thoughts
              </span>
              {isThinkingExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
          </div>

          {isThinkingExpanded && (
            <div className="p-2.5 space-y-1.5 text-[11px] font-mono leading-relaxed bg-black/40">
              {agentThoughts.length === 0 && isGenerating ? (
                <div className="flex items-center gap-2 text-purple-400 py-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Analyzing architecture, design system, and Stitch UI tokens...</span>
                </div>
              ) : (
                agentThoughts.map((thought, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-purple-200">
                    <span className="text-purple-400 shrink-0 select-none font-bold">›</span>
                    <span className="break-words">{thought}</span>
                  </div>
                ))
              )}

              {/* Active command executing in sandbox */}
              {activeCommand && (
                <div className="flex items-center gap-2 text-emerald-400 pt-1 border-t border-purple-500/20 text-[10px]">
                  <Command className="h-3 w-3 animate-spin" />
                  <span>Sandbox running: <code className="bg-black/60 px-1 py-0.5 rounded">{activeCommand}</code></span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. STEP BY STEP EXECUTION TRACKER */}
      <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
        {/* Header Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between px-3 py-2 bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer select-none border-b border-border/50"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Zap className="h-3 w-3" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                {isGenerating ? "Building Project..." : "Execution Finished"}
              </span>
              <Badge
                variant={isGenerating ? "violet" : "success"}
                className="text-[10px] py-0 px-1.5 h-4 font-mono font-bold"
              >
                {completedCount} / {steps.length} Steps
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <span className="text-[11px] hidden sm:inline-block truncate max-w-[150px]">
              {currentStep ? currentStep.title : "Ready"}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        </div>

        {/* Collapsible Steps Content */}
        {isExpanded && (
          <div className="p-2.5 space-y-2 text-xs">
            {steps.map((step) => {
              const isDone = step.status === "completed";
              const isCurrent = step.status === "in_progress";
              const isLogOpen = activeLogTab === step.id;

              return (
                <div
                  key={step.id}
                  className={`rounded-lg border p-2 transition-all ${
                    isCurrent
                      ? "border-primary/50 bg-primary/5 shadow-xs"
                      : isDone
                      ? "border-border/60 bg-muted/20"
                      : "border-border/40 bg-muted/10 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                      )}

                      <span
                        className={`text-xs font-medium ${
                          isCurrent
                            ? "text-primary font-semibold"
                            : isDone
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>

                    {step.logs && step.logs.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLogTab(isLogOpen ? null : step.id);
                        }}
                        className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 bg-secondary/80 px-1.5 py-0.5 rounded border border-border/50"
                      >
                        <Terminal className="h-2.5 w-2.5 text-primary" />
                        <span>{isLogOpen ? "Hide" : "Log"}</span>
                      </button>
                    )}
                  </div>

                  {/* Sub details or files created */}
                  {step.detail && (
                    <p className="text-[11px] text-muted-foreground ml-5 mt-1 leading-relaxed">
                      {step.detail}
                    </p>
                  )}

                  {/* Modified Files Chips */}
                  {step.files && step.files.length > 0 && (
                    <div className="ml-5 mt-1.5 flex flex-wrap gap-1">
                      {step.files.map((file) => (
                        <button
                          key={file}
                          onClick={() => onViewDiff && onViewDiff(file)}
                          className="inline-flex items-center gap-1 rounded bg-background px-1.5 py-0.5 text-[10px] font-mono text-foreground border border-border hover:border-primary/60 hover:text-primary transition-colors"
                        >
                          <FileCode2 className="h-2.5 w-2.5 text-primary" />
                          <span>{file}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Inline Terminal Logs */}
                  {isLogOpen && step.logs && (
                    <div className="ml-5 mt-2 rounded bg-black/90 p-2 font-mono text-[10px] text-emerald-400 space-y-0.5 overflow-x-auto shadow-inner border border-white/10">
                      {step.logs.map((log, lIdx) => (
                        <div key={lIdx} className="leading-snug">
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
