"use client";

import * as React from "react";
import {
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  FileCode2,
  X,
  WrapText,
  Download,
  Terminal,
  Layers,
  Save,
  Search,
  CheckCheck,
  Code,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export interface OpenTab {
  id: string;
  name: string;
  path: string;
  content: string;
  isDirty?: boolean;
}

interface CodeEditorViewProps {
  tabs?: OpenTab[];
  openTabs?: OpenTab[];
  activeTabId?: string;
  onSelectTab?: (tabId: string) => void;
  onCloseTab?: (tabId: string) => void;
  onCodeChange?: (tabId: string, newCode: string) => void;
  onChangeCode?: (newCode: string) => void;
  onFormatCode?: () => void;
  onResetCode?: () => void;
  onDownloadZip?: () => void;
}

export function CodeEditorView({
  tabs: propTabs,
  openTabs: propOpenTabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCodeChange,
  onChangeCode,
  onFormatCode,
  onResetCode,
  onDownloadZip,
}: CodeEditorViewProps) {
  const [copied, setCopied] = React.useState(false);
  const [wordWrap, setWordWrap] = React.useState(true);
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const tabs = propTabs || propOpenTabs || [];
  const activeTab = tabs.find((t) => t.id === activeTabId || t.path === activeTabId) || tabs[0];

  const handleCopy = () => {
    if (!activeTab) return;
    navigator.clipboard.writeText(activeTab.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorChange = (val: string) => {
    if (onCodeChange && activeTab) {
      onCodeChange(activeTab.id, val);
    }
    if (onChangeCode) {
      onChangeCode(val);
    }
  };

  const handleDownloadActiveFile = () => {
    if (!activeTab) return;
    const blob = new Blob([activeTab.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = activeTab.name || "code.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFormatCode = () => {
    if (!activeTab) return;
    try {
      // Basic formatting: standard 2-space indentation normalization
      const lines = activeTab.content.split("\n");
      const trimmed = lines.map((l) => l.trimEnd()).join("\n");
      handleEditorChange(trimmed);
      if (onFormatCode) onFormatCode();
    } catch {}
  };

  const lineCount = activeTab ? activeTab.content.split("\n").length : 0;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 25) }, (_, i) => i + 1);

  if (!activeTab) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-card/30 text-muted-foreground p-8 text-center select-none">
        <FileCode2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-medium text-foreground">No File Open</p>
        <p className="text-xs text-muted-foreground mt-1">
          Select a file from the explorer sidebar to inspect or edit the source code.
        </p>
      </div>
    );
  }

  const getLanguageLabel = (path: string) => {
    if (path.endsWith(".tsx")) return "TypeScript JSX";
    if (path.endsWith(".jsx")) return "JavaScript JSX";
    if (path.endsWith(".ts")) return "TypeScript";
    if (path.endsWith(".js")) return "JavaScript";
    if (path.endsWith(".json")) return "JSON";
    if (path.endsWith(".css")) return "CSS";
    if (path.endsWith(".html")) return "HTML";
    return "Source Code";
  };

  return (
    <div className="flex h-full w-full flex-col bg-background font-mono text-xs overflow-hidden">
      {/* Tab Bar */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/70 bg-card/70 px-2 overflow-x-auto no-scrollbar select-none">
        <div className="flex items-center gap-1 min-w-0">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId || tab.path === activeTabId;
            return (
              <div
                key={tab.id || tab.path}
                onClick={() => onSelectTab?.(tab.id || tab.path)}
                className={`group flex items-center gap-2 rounded-t-md px-3 py-1.5 text-xs font-mono cursor-pointer border-t-2 transition-all ${
                  isActive
                    ? "border-primary bg-background text-foreground font-semibold shadow-xs"
                    : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <FileCode2
                  className={`h-3.5 w-3.5 ${
                    tab.name.endsWith(".tsx") || tab.name.endsWith(".jsx")
                      ? "text-cyan-400"
                      : tab.name.endsWith(".css")
                      ? "text-pink-400"
                      : tab.name.endsWith(".json")
                      ? "text-amber-400"
                      : "text-blue-400"
                  }`}
                />
                <span className="truncate max-w-[130px] text-[11px]">{tab.name}</span>

                {tab.isDirty && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}

                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab?.(tab.id || tab.path);
                    }}
                    className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Editor Actions Toolbar */}
        <div className="flex items-center gap-1 pl-2">
          <Tooltip content="Find in file (Ctrl+F)">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-1.5 rounded transition-colors ${
                showSearch ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Format code">
            <button
              onClick={handleFormatCode}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Code className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Word wrap">
            <button
              onClick={() => setWordWrap(!wordWrap)}
              className={`p-1.5 rounded transition-colors ${
                wordWrap ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <WrapText className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip content={copied ? "Copied!" : "Copy code"}>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </Tooltip>

          <Tooltip content="Download file">
            <button
              onClick={handleDownloadActiveFile}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          {onDownloadZip && (
            <Tooltip content="Export full project (.zip)">
              <button
                onClick={onDownloadZip}
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-xs font-sans font-medium text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/50 transition-colors"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Export ZIP</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* In-File Search Bar */}
      {showSearch && (
        <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border/50 bg-muted/40 px-3 animate-fade-in">
          <Search className="h-3 w-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search in open file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <button
            onClick={() => setShowSearch(false)}
            className="text-muted-foreground hover:text-foreground text-[11px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Breadcrumb Path Bar */}
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-border/50 bg-muted/20 px-3 text-[11px] text-muted-foreground select-none">
        <div className="flex items-center gap-1 truncate font-mono">
          <span className="text-muted-foreground/60">root</span>
          <span>/</span>
          {activeTab.path.split("/").map((segment, idx, arr) => (
            <React.Fragment key={idx}>
              <span className={idx === arr.length - 1 ? "text-foreground font-medium" : ""}>{segment}</span>
              {idx < arr.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </div>

        <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 font-mono">
          {getLanguageLabel(activeTab.path)}
        </Badge>
      </div>

      {/* Main Code Editor Area */}
      <div className="flex-1 flex overflow-hidden bg-background relative">
        {/* Line Numbers Gutter */}
        <div className="w-12 shrink-0 border-r border-border/50 bg-muted/15 py-3 select-none text-right pr-3 text-muted-foreground/50 text-[11px] font-mono leading-6 overflow-hidden">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Code Content Area */}
        <div className="flex-1 relative overflow-auto p-3">
          <textarea
            ref={textareaRef}
            value={activeTab.content}
            onChange={(e) => handleEditorChange(e.target.value)}
            spellCheck={false}
            wrap={wordWrap ? "soft" : "off"}
            className="w-full h-full min-h-[500px] resize-none bg-transparent font-mono text-xs text-foreground/90 leading-6 focus:outline-none selection:bg-primary/25 border-none p-0 tab-4"
            style={{ tabSize: 2 }}
          />
        </div>
      </div>

      {/* Bottom Editor Status Bar */}
      <div className="flex h-6 shrink-0 items-center justify-between border-t border-border/60 bg-muted/30 px-3 text-[10px] text-muted-foreground font-mono select-none">
        <div className="flex items-center gap-3">
          <span>Ln {lineCount}, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live HMR Ready
          </span>
        </div>
      </div>
    </div>
  );
}
