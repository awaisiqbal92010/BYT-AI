"use client";

import * as React from "react";
import {
  Folder,
  FolderOpen,
  FileCode2,
  FileJson,
  FileText,
  Palette,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Trash2,
  Edit2,
  MoreVertical,
  Layers,
  FilePlus,
  FolderPlus,
  Smartphone,
  Globe,
  Settings,
  Check,
  X,
} from "@/components/icons/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  extension?: string;
  content?: string;
  children?: FileItem[];
}

interface FileTreeExplorerProps {
  files: FileItem[];
  activeFilePath?: string;
  activeFileId?: string;
  onSelectFile: (file: FileItem) => void;
  onCreateFile?: (parentPath: string, fileName: string) => void;
  onCreateFolder?: (parentPath: string, folderName: string) => void;
  onDeleteFile?: (filePath: string) => void;
  onRenameFile?: (oldPath: string, newName: string) => void;
  onDownloadZip?: () => void;
}

// Count total files recursively
function countFiles(items: FileItem[]): number {
  let count = 0;
  for (const item of items) {
    if (item.type === "file") count++;
    if (item.children) count += countFiles(item.children);
  }
  return count;
}

export function FileTreeExplorer({
  files,
  activeFilePath,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onRenameFile,
  onDownloadZip,
}: FileTreeExplorerProps) {
  const currentActive = activeFilePath || activeFileId || "";

  // Helper to extract all folder paths recursively
  const getAllFolderPaths = React.useCallback((items: FileItem[]): string[] => {
    let paths: string[] = [];
    for (const item of items) {
      if (item.type === "folder") {
        paths.push(item.path);
        if (item.children) {
          paths = paths.concat(getAllFolderPaths(item.children));
        }
      }
    }
    return paths;
  }, []);

  const [openFolders, setOpenFolders] = React.useState<Record<string, boolean>>({
    src: true,
    "src/components": true,
    components: true,
    app: true,
    "app/api": true,
    lib: true,
  });

  // Auto-expand any folders that contain files
  React.useEffect(() => {
    if (files && files.length > 0) {
      const allFolders = getAllFolderPaths(files);
      setOpenFolders((prev) => {
        const next = { ...prev };
        for (const folder of allFolders) {
          if (next[folder] === undefined) {
            next[folder] = true;
          }
        }
        return next;
      });
    }
  }, [files, getAllFolderPaths]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [creationMode, setCreationMode] = React.useState<"file" | "folder" | null>(null);
  const [targetParentPath, setTargetParentPath] = React.useState<string>("");
  const [newItemName, setNewItemName] = React.useState("");
  const [renamingPath, setRenamingPath] = React.useState<string | null>(null);
  const [renamedTitle, setRenamedTitle] = React.useState("");

  const toggleFolder = (folderPath: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const handleToggleAllFolders = () => {
    const allFolders = getAllFolderPaths(files);
    const hasClosed = allFolders.some((f) => !openFolders[f]);
    const nextState: Record<string, boolean> = {};
    for (const f of allFolders) {
      nextState[f] = hasClosed;
    }
    setOpenFolders(nextState);
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === "folder") {
      return openFolders[file.path] ? (
        <FolderOpen className="h-3.5 w-3.5 text-amber-400 shrink-0" />
      ) : (
        <Folder className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      );
    }

    const name = file.name.toLowerCase();

    if (name === "app.json" || name === "eas.json") {
      return <Smartphone className="h-3.5 w-3.5 text-purple-400 shrink-0" />;
    }
    if (name.includes("vite.config") || name.includes("next.config") || name.includes("metro.config")) {
      return <Settings className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
    }
    if (name.endsWith(".tsx") || name.endsWith(".jsx")) {
      return <FileCode2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />;
    }
    if (name.endsWith(".ts") || name.endsWith(".js")) {
      return <FileCode2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    }
    if (name.endsWith(".css")) {
      return <Palette className="h-3.5 w-3.5 text-pink-400 shrink-0" />;
    }
    if (name.endsWith(".json")) {
      return <FileJson className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
    }
    if (name.endsWith(".html")) {
      return <Globe className="h-3.5 w-3.5 text-orange-400 shrink-0" />;
    }
    return <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (creationMode === "file" && onCreateFile) {
      onCreateFile(targetParentPath, newItemName.trim());
    } else if (creationMode === "folder" && onCreateFolder) {
      onCreateFolder(targetParentPath, newItemName.trim());
    }
    setNewItemName("");
    setCreationMode(null);
  };

  const handleRenameSubmit = (oldPath: string) => {
    if (renamedTitle.trim() && onRenameFile && renamedTitle.trim() !== oldPath.split("/").pop()) {
      onRenameFile(oldPath, renamedTitle.trim());
    }
    setRenamingPath(null);
    setRenamedTitle("");
  };

  const totalFilesCount = React.useMemo(() => countFiles(files), [files]);

  const renderTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => {
      const isFolder = item.type === "folder";
      const isOpen = openFolders[item.path];
      const isActive = currentActive === item.path || currentActive === item.id;
      const isRenaming = renamingPath === item.path;

      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.children?.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return null;
      }

      return (
        <div key={item.path} className="select-none">
          <div
            onClick={() => {
              if (isFolder) {
                toggleFolder(item.path);
              } else {
                onSelectFile(item);
              }
            }}
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
            className={`group flex items-center justify-between py-1 px-2 rounded-md text-xs cursor-pointer transition-all ${
              isActive
                ? "bg-primary/15 text-primary font-medium border-l-2 border-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1">
              {isFolder && (
                <span className="text-muted-foreground/70 shrink-0">
                  {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </span>
              )}
              {getFileIcon(item)}

              {isRenaming ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={renamedTitle}
                    onChange={(e) => setRenamedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit(item.path);
                      if (e.key === "Escape") setRenamingPath(null);
                    }}
                    autoFocus
                    className="h-5 px-1 bg-background text-[11px] font-mono border border-primary rounded text-foreground outline-none"
                  />
                  <button
                    onClick={() => handleRenameSubmit(item.path)}
                    className="p-0.5 text-emerald-400 hover:text-emerald-300"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setRenamingPath(null)}
                    className="p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <span className="truncate text-[11px] font-mono">{item.name}</span>
              )}
            </div>

            {/* Hover Actions */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
              {isFolder && onCreateFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTargetParentPath(item.path);
                    setCreationMode("file");
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded"
                  title="New file in this folder"
                >
                  <FilePlus className="h-3 w-3" />
                </button>
              )}

              {onRenameFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingPath(item.path);
                    setRenamedTitle(item.name);
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded"
                  title="Rename"
                >
                  <Edit2 className="h-2.5 w-2.5" />
                </button>
              )}

              {!isFolder && onDeleteFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(item.path);
                  }}
                  className="p-1 text-muted-foreground hover:text-red-400 hover:bg-muted/80 rounded"
                  title="Delete file"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Children list */}
          {isFolder && isOpen && item.children && (
            <div className="space-y-0.5 mt-0.5">{renderTree(item.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex h-full w-full flex-col bg-card/50 border-r border-border/70 text-xs select-none">
      {/* Explorer Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/60 px-3 bg-muted/20">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Explorer
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/80 bg-muted/60 px-1.5 py-0.2 rounded">
            {totalFilesCount}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content="New File">
            <button
              onClick={() => {
                setTargetParentPath("");
                setCreationMode("file");
              }}
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <FilePlus className="h-3 w-3" />
            </button>
          </Tooltip>

          <Tooltip content="New Folder">
            <button
              onClick={() => {
                setTargetParentPath("");
                setCreationMode("folder");
              }}
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <FolderPlus className="h-3 w-3" />
            </button>
          </Tooltip>

          <Tooltip content="Expand / Collapse All Folders">
            <button
              onClick={handleToggleAllFolders}
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <FolderOpen className="h-3 w-3" />
            </button>
          </Tooltip>

          {onDownloadZip && (
            <Tooltip content="Download All Files (.zip)">
              <button
                onClick={onDownloadZip}
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-cyan-400 transition-colors"
              >
                <Layers className="h-3 w-3 text-cyan-400" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Inline File / Folder Creation Input */}
      {creationMode && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-border/60 bg-muted/40 animate-fade-in">
          <div className="text-[10px] font-medium text-muted-foreground mb-1">
            {creationMode === "file" ? "New File" : "New Folder"}{" "}
            {targetParentPath ? `in /${targetParentPath}` : "in root"}
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder={creationMode === "file" ? "e.g. Header.tsx or utils.ts" : "e.g. components"}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              autoFocus
              className="w-full rounded bg-background px-2 py-1 text-[11px] font-mono border border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="rounded bg-primary px-2 py-1 text-[10px] font-semibold text-white shrink-0"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setCreationMode(null)}
              className="rounded px-1.5 py-1 text-[10px] text-muted-foreground hover:bg-muted shrink-0"
            >
              ✕
            </button>
          </div>
        </form>
      )}

      {/* Quick Search */}
      <div className="p-2 border-b border-border/40">
        <div className="relative">
          <Search className="h-3 w-3 absolute left-2 top-2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter files (e.g. App, page, css)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded bg-muted/40 pl-7 pr-2 py-1 text-[11px] font-mono placeholder:text-muted-foreground/60 border border-transparent focus:border-border focus:outline-none"
          />
        </div>
      </div>

      {/* Tree View Scroll Area */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">{renderTree(files)}</div>

      {/* Bottom Summary Bar */}
      <div className="h-7 shrink-0 border-t border-border/50 bg-muted/20 px-3 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <span>
          {totalFilesCount} {totalFilesCount === 1 ? "file" : "files"}
        </span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
