"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  Layout,
  FolderKanban,
  Sparkles,
  Rocket,
  Settings,
  History,
  Code,
  Sun,
  Moon,
  Bot,
  Zap,
  ArrowRight,
} from "@/components/icons/hugeicons";
import { Badge } from "@/components/ui/badge";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "AI Actions" | "Quick Tools";
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

export interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CommandPalette({ isOpen: propIsOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = propIsOpen !== undefined;
  const isOpen = isControlled ? propIsOpen : internalOpen;

  const handleClose = React.useCallback(() => {
    if (onClose) onClose();
    if (!isControlled) setInternalOpen(false);
  }, [onClose, isControlled]);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "nav-builder",
      title: "Open AI Builder Workspace",
      category: "Navigation",
      icon: <Layout className="h-4 w-4 text-primary" />,
      action: () => router.push("/"),
      shortcut: "G B",
    },
    {
      id: "nav-projects",
      title: "View All Projects",
      category: "Navigation",
      icon: <FolderKanban className="h-4 w-4 text-blue-500" />,
      action: () => router.push("/projects"),
      shortcut: "G P",
    },
    {
      id: "nav-templates",
      title: "Explore Starter Templates",
      category: "Navigation",
      icon: <Sparkles className="h-4 w-4 text-amber-500" />,
      action: () => router.push("/templates"),
      shortcut: "G T",
    },
    {
      id: "nav-deployments",
      title: "Deployments & Domains",
      category: "Navigation",
      icon: <Rocket className="h-4 w-4 text-emerald-500" />,
      action: () => router.push("/deployments"),
      shortcut: "G D",
    },
    {
      id: "nav-settings",
      title: "Project & AI Settings",
      category: "Navigation",
      icon: <Settings className="h-4 w-4 text-muted-foreground" />,
      action: () => router.push("/settings"),
      shortcut: "G S",
    },
    {
      id: "nav-history",
      title: "Version History & Diffs",
      category: "Navigation",
      icon: <History className="h-4 w-4 text-purple-500" />,
      action: () => router.push("/history"),
      shortcut: "G H",
    },
    // AI Actions
    {
      id: "ai-prompt",
      title: "Generate New UI with Prompt",
      category: "AI Actions",
      icon: <Zap className="h-4 w-4 text-primary" />,
      action: () => router.push("/"),
      shortcut: "⌘ N",
    },
    {
      id: "ai-model-claude",
      title: "Set Default Model: Claude 3.5 Sonnet",
      category: "AI Actions",
      icon: <Bot className="h-4 w-4 text-violet-500" />,
      action: () => router.push("/settings"),
    },
    {
      id: "ai-model-gpt",
      title: "Set Default Model: GPT-4o",
      category: "AI Actions",
      icon: <Bot className="h-4 w-4 text-emerald-500" />,
      action: () => router.push("/settings"),
    },
    // Quick Tools
    {
      id: "tool-theme",
      title: `Toggle Theme (Currently ${theme === "dark" ? "Dark" : "Light"})`,
      category: "Quick Tools",
      icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      action: () => setTheme(theme === "dark" ? "light" : "dark"),
      shortcut: "⌘ T",
    },
    {
      id: "tool-export",
      title: "Export Project ZIP",
      category: "Quick Tools",
      icon: <Code className="h-4 w-4 text-muted-foreground" />,
      action: () => {},
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose?.(); // toggle
      } else if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        onClose?.();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 animate-fade-in">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-border/80 px-4 py-3 bg-muted/20">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command, search screens, or ask AI..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Badge variant="outline" className="text-[10px] font-mono">
            ESC
          </Badge>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching commands or screens found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  onClose?.();
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${
                  idx === selectedIndex
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary/80 border border-border/50">
                    {cmd.icon}
                  </div>
                  <div className="text-left">
                    <span className="block font-medium">{cmd.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {cmd.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cmd.shortcut && (
                    <span className="text-[10px] font-mono text-muted-foreground rounded bg-muted/60 px-1.5 py-0.5 border border-border/40">
                      {cmd.shortcut}
                    </span>
                  )}
                  <ArrowRight className="h-3 w-3 opacity-40" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 bg-muted/30 text-[10px] text-muted-foreground">
          <span>Navigate with ↑ ↓ and ↵ Enter</span>
          <span>BYT AI Command Palette</span>
        </div>
      </div>
    </div>
  );
}
