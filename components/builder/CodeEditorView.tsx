"use client";

import * as React from "react";
import Editor, { OnMount } from "@monaco-editor/react";
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
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { FileIcon } from "./FileIcons";

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
  onSwitchToPreview?: () => void;
}

function getMonacoLanguage(path: string): string {
  const p = path.toLowerCase();
  if (p.endsWith(".tsx") || p.endsWith(".ts")) return "typescript";
  if (p.endsWith(".jsx") || p.endsWith(".js") || p.endsWith(".mjs") || p.endsWith(".cjs")) return "javascript";
  if (p.endsWith(".html") || p.endsWith(".htm")) return "html";
  if (p.endsWith(".css") || p.endsWith(".scss") || p.endsWith(".less")) return "css";
  if (p.endsWith(".json")) return "json";
  if (p.endsWith(".md") || p.endsWith(".mdx")) return "markdown";
  if (p.endsWith(".py")) return "python";
  if (p.endsWith(".svg") || p.endsWith(".xml")) return "xml";
  if (p.endsWith(".sh") || p.endsWith(".bash")) return "shell";
  if (p.endsWith(".yaml") || p.endsWith(".yml")) return "yaml";
  if (p.endsWith(".sql")) return "sql";
  return "plaintext";
}

function getLanguageBadgeLabel(path: string): string {
  const p = path.toLowerCase();
  if (p.endsWith(".tsx")) return "React TypeScript (.tsx)";
  if (p.endsWith(".jsx")) return "React JavaScript (.jsx)";
  if (p.endsWith(".ts")) return "TypeScript (.ts)";
  if (p.endsWith(".js")) return "JavaScript (.js)";
  if (p.endsWith(".html")) return "HTML5 (.html)";
  if (p.endsWith(".css")) return "CSS3 (.css)";
  if (p.endsWith(".json")) return "JSON Data (.json)";
  if (p.endsWith(".md")) return "Markdown (.md)";
  if (p.endsWith(".py")) return "Python (.py)";
  if (p.endsWith(".svg")) return "SVG Vector (.svg)";
  return "Source File";
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
  onSwitchToPreview,
}: CodeEditorViewProps) {
  const [copied, setCopied] = React.useState(false);
  const [wordWrap, setWordWrap] = React.useState<"on" | "off">("on");
  const [showMinimap, setShowMinimap] = React.useState(true);
  const [fontSize, setFontSize] = React.useState(13);
  const [cursorPosition, setCursorPosition] = React.useState({ ln: 1, col: 1 });
  const editorRef = React.useRef<any>(null);

  const tabs = propTabs || propOpenTabs || [];
  const activeTab = tabs.find((t) => t.id === activeTabId || t.path === activeTabId) || tabs[0];

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Listen to cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        ln: e.position.lineNumber,
        col: e.position.column,
      });
    });

    // Configure TypeScript / JavaScript compiler options for React JSX
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTextExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      jsxFactory: "React.createElement",
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"],
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTextExtensions: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      allowJs: true,
    });
  };

  const handleCopy = () => {
    if (!activeTab) return;
    navigator.clipboard.writeText(activeTab.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorChange = (val: string | undefined) => {
    const newContent = val ?? "";
    if (onCodeChange && activeTab) {
      onCodeChange(activeTab.id, newContent);
    }
    if (onChangeCode) {
      onChangeCode(newContent);
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

  const handleFormatDocument = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run();
      if (onFormatCode) onFormatCode();
    }
  };

  const handleTriggerFind = () => {
    if (editorRef.current) {
      editorRef.current.getAction("actions.find")?.run();
    }
  };

  if (!activeTab) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-card/30 text-muted-foreground p-8 text-center select-none font-mono">
        <FileCode2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-semibold text-foreground">No File Open</p>
        <p className="text-xs text-muted-foreground mt-1">
          Select a file from the explorer sidebar to view and edit in the VS Code editor.
        </p>
      </div>
    );
  }

  const language = getMonacoLanguage(activeTab.path);

  return (
    <div className="flex h-full w-full flex-col bg-[#1e1e1e] text-slate-200 overflow-hidden font-sans">
      {/* 1. VS Code Tab Bar */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/40 bg-[#252526] px-2 overflow-x-auto no-scrollbar select-none">
        <div className="flex items-center gap-0.5 min-w-0">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId || tab.path === activeTabId;
            return (
              <div
                key={tab.id || tab.path}
                onClick={() => onSelectTab?.(tab.id || tab.path)}
                className={`group flex items-center gap-2 px-3 py-1.5 text-xs font-mono cursor-pointer border-t-2 transition-all select-none ${
                  isActive
                    ? "border-primary bg-[#1e1e1e] text-white font-medium"
                    : "border-transparent text-slate-400 hover:bg-[#2d2d2d] hover:text-slate-200"
                }`}
                title={tab.path}
              >
                <FileIcon filename={tab.name} className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[140px] text-[11px]">{tab.name}</span>

                {tab.isDirty && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" title="Unsaved changes" />
                )}

                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab?.(tab.id || tab.path);
                    }}
                    className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-opacity"
                    title="Close Tab"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* VS Code Editor Action Icons */}
        <div className="flex items-center gap-1 pl-2">
          <Tooltip content="Find in File (Ctrl+F)">
            <button
              onClick={handleTriggerFind}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Format Document (Shift+Alt+F)">
            <button
              onClick={handleFormatDocument}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Code className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip content={`Toggle Word Wrap (${wordWrap === "on" ? "Enabled" : "Disabled"})`}>
            <button
              onClick={() => setWordWrap((prev) => (prev === "on" ? "off" : "on"))}
              className={`p-1.5 rounded transition-colors ${
                wordWrap === "on" ? "bg-primary/20 text-primary" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <WrapText className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip content={`Toggle Minimap (${showMinimap ? "Visible" : "Hidden"})`}>
            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className={`p-1.5 rounded transition-colors ${
                showMinimap ? "bg-slate-800 text-slate-200" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          <Tooltip content={copied ? "Copied to Clipboard!" : "Copy Full Code"}>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </Tooltip>

          <Tooltip content="Download File">
            <button
              onClick={handleDownloadActiveFile}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          {onDownloadZip && (
            <Tooltip content="Export All Files (.zip)">
              <button
                onClick={onDownloadZip}
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/50 transition-colors"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Export ZIP</span>
              </button>
            </Tooltip>
          )}

          {onSwitchToPreview && (
            <Tooltip content="Switch to Live Preview (Hotkey: 1 / Ctrl+P)">
              <button
                onClick={onSwitchToPreview}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-primary bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all shadow-2xs"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* 2. Breadcrumb Path Bar */}
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-border/30 bg-[#1e1e1e] px-3 text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-1.5 truncate font-mono">
          <FileIcon filename={activeTab.name} className="h-3 w-3 shrink-0" />
          <span className="text-slate-500">project</span>
          <span className="text-slate-600">/</span>
          {activeTab.path.split("/").map((segment, idx, arr) => (
            <React.Fragment key={idx}>
              <span className={idx === arr.length - 1 ? "text-slate-200 font-medium" : "text-slate-400"}>
                {segment}
              </span>
              {idx < arr.length - 1 && <span className="text-slate-600">/</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] py-0 px-2 h-4 font-mono border-slate-700 text-slate-300">
            {getLanguageBadgeLabel(activeTab.path)}
          </Badge>
        </div>
      </div>

      {/* 3. Real Monaco VS Code Editor */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[#1e1e1e]">
        <Editor
          height="100%"
          path={activeTab.path}
          defaultLanguage={language}
          language={language}
          value={activeTab.content}
          theme="vs-dark"
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Consolas, monospace",
            fontLigatures: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap,
            minimap: { enabled: showMinimap, maxColumn: 80, renderCharacters: false },
            lineNumbers: "on",
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            bracketPairColorization: { enabled: true },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            renderWhitespace: "selection",
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            formatOnPaste: true,
            formatOnType: false,
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            padding: { top: 8, bottom: 8 },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
          }}
        />
      </div>

      {/* 4. VS Code Status Bar */}
      <div className="flex h-6 shrink-0 items-center justify-between border-t border-border/40 bg-[#007acc] text-white px-3 text-[10px] font-mono select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-semibold">
            <span>BYT VS Code</span>
          </span>
          <span>Ln {cursorPosition.ln}, Col {cursorPosition.col}</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span className="capitalize">{language}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" /> Live Dev Server Sync
          </span>
        </div>
      </div>
    </div>
  );
}
