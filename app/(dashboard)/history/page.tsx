"use client";

import * as React from "react";
import {
  History,
  GitCommit,
  RotateCcw,
  FileCode2,
  CheckCircle2,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  Bot,
  User,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

interface Checkpoint {
  id: string;
  version: string;
  timestamp: string;
  prompt: string;
  author: "user" | "ai";
  changedFiles: string[];
  additions: number;
  deletions: number;
}

const CHECKPOINTS: Checkpoint[] = [
  {
    id: "cp-4",
    version: "v1.3 (Current)",
    timestamp: "10 mins ago",
    prompt: "Make the pricing cards have a glassmorphism hover effect and add a glowing 'Most Popular' badge.",
    author: "ai",
    changedFiles: ["components/PricingCards.tsx", "app/globals.css"],
    additions: 42,
    deletions: 12,
  },
  {
    id: "cp-3",
    version: "v1.2",
    timestamp: "1 hour ago",
    prompt: "Add interactive monthly/annual pricing toggle with 20% discount calculation.",
    author: "user",
    changedFiles: ["components/PricingCards.tsx"],
    additions: 28,
    deletions: 4,
  },
  {
    id: "cp-2",
    version: "v1.1",
    timestamp: "3 hours ago",
    prompt: "Create responsive feature grid with Lucide icons and hover glow borders.",
    author: "ai",
    changedFiles: ["components/HeroSection.tsx", "app/page.tsx"],
    additions: 85,
    deletions: 8,
  },
  {
    id: "cp-1",
    version: "v1.0",
    timestamp: "Yesterday",
    prompt: "Initialize Next.js project with dark mode palette and split dashboard shell.",
    author: "ai",
    changedFiles: ["app/layout.tsx", "app/page.tsx", "tailwind.config.ts"],
    additions: 160,
    deletions: 0,
  },
];

export default function HistoryPage() {
  const [selectedCheckpoint, setSelectedCheckpoint] = React.useState<Checkpoint>(
    CHECKPOINTS[0]
  );
  const [selectedFile, setSelectedFile] = React.useState<string>(
    CHECKPOINTS[0].changedFiles[0]
  );
  const [rollbackSuccess, setRollbackSuccess] = React.useState(false);

  const handleRollback = () => {
    setRollbackSuccess(true);
    setTimeout(() => setRollbackSuccess(false), 2500);
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="violet" className="text-xs gap-1">
                <History className="h-3 w-3" /> Version Control & Checkpoints
              </Badge>
              <span className="text-xs text-muted-foreground">Every prompt is snapshot-versioned</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Version History & Code Diffs
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Inspect code changes generated across each AI prompt cycle and rollback to any historical point in one click.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRollback}
            className="gap-1.5 font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5 text-primary" />
            <span>{rollbackSuccess ? "Restored to Checkpoint!" : "Restore This Version"}</span>
          </Button>
        </div>

        {/* Main Grid: Left Timeline / Right Diff Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Timeline list (5 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prompt Iterations ({CHECKPOINTS.length})
            </h3>

            <div className="space-y-2">
              {CHECKPOINTS.map((cp) => {
                const isSelected = selectedCheckpoint.id === cp.id;
                return (
                  <div
                    key={cp.id}
                    onClick={() => {
                      setSelectedCheckpoint(cp);
                      setSelectedFile(cp.changedFiles[0]);
                    }}
                    className={`rounded-lg border p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-card/60 hover:bg-card hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isSelected ? "violet" : "outline"}
                          className="text-[10px] font-mono font-bold"
                        >
                          {cp.version}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {cp.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span className="text-emerald-500">+{cp.additions}</span>
                        <span className="text-red-500">-{cp.deletions}</span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground font-medium line-clamp-2 leading-relaxed">
                      &ldquo;{cp.prompt}&rdquo;
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{cp.changedFiles.length} files modified</span>
                      <span className="text-primary font-medium flex items-center gap-0.5">
                        Inspect Diff <ArrowRight className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Code Diff Inspector (8 cols) */}
          <div className="lg:col-span-8 rounded-lg border border-border bg-card overflow-hidden flex flex-col shadow-sm">
            {/* Diff Header */}
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 p-3 px-4">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground font-mono">
                  {selectedFile}
                </span>
              </div>

              {/* File selector buttons */}
              <div className="flex items-center gap-1">
                {selectedCheckpoint.changedFiles.map((file) => (
                  <button
                    key={file}
                    onClick={() => setSelectedFile(file)}
                    className={`rounded px-2 py-1 text-[11px] font-mono transition-colors ${
                      selectedFile === file
                        ? "bg-background text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {file.split("/").pop()}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Diff Display */}
            <div className="flex-1 bg-black p-4 font-mono text-xs overflow-x-auto text-slate-300 leading-6 select-text">
              <div className="space-y-0.5">
                <div className="text-muted-foreground pb-2 text-[11px]">
                  @@ -12,8 +12,14 @@ export function PricingCards() @@
                </div>

                <div className="text-slate-400 pl-4">
                  {"  "}const tiers = [
                </div>
                <div className="text-slate-400 pl-4">
                  {"    "}{`{ name: "Starter", price: "$0/mo" },`}
                </div>

                {/* Deletions */}
                <div className="bg-red-500/15 text-red-300 px-2 rounded-xs flex items-center gap-2">
                  <span className="text-red-500 font-bold select-none">-</span>
                  <span>{`    { name: "Pro", price: "$29/mo", highlight: false },`}</span>
                </div>

                {/* Additions */}
                <div className="bg-emerald-500/15 text-emerald-300 px-2 rounded-xs flex items-center gap-2">
                  <span className="text-emerald-500 font-bold select-none">+</span>
                  <span>{`    { name: "Pro", price: "$29/mo", highlight: true, badge: "Most Popular" },`}</span>
                </div>
                <div className="bg-emerald-500/15 text-emerald-300 px-2 rounded-xs flex items-center gap-2">
                  <span className="text-emerald-500 font-bold select-none">+</span>
                  <span>{`    // Added animated glass hover effect & violet border highlight`}</span>
                </div>
                <div className="bg-emerald-500/15 text-emerald-300 px-2 rounded-xs flex items-center gap-2">
                  <span className="text-emerald-500 font-bold select-none">+</span>
                  <span>{`    className="backdrop-blur-md bg-card/80 border-primary/40 hover:scale-105 transition-all"`}</span>
                </div>

                <div className="text-slate-400 pl-4">
                  {"  "}];
                </div>
                <div className="text-slate-400 pl-4">
                  {"  "}return (
                </div>
                <div className="text-slate-400 pl-4">
                  {"    "}{`<div className="grid grid-cols-1 md:grid-cols-3 gap-6">`}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/80 bg-muted/20 p-3 px-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Checkpoint valid & build verified
              </span>
              <span className="font-mono text-[11px]">
                Commit SHA: 8f29ac14b2
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
