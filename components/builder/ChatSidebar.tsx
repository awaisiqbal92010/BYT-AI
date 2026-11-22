"use client";

import * as React from "react";
import {
  Sparkles,
  Send,
  Paperclip,
  Wand2,
  FileCode2,
  CheckCircle2,
  RotateCcw,
  Bot,
  User,
  Plus,
  ArrowRight,
  Mic,
  Cpu,
  History,
  Code2,
  Download,
  Copy,
  Check,
} from "@/components/icons/hugeicons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { ActivityStreamer, ExecutionStep } from "./ActivityStreamer";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  timestamp: string;
  content: string;
  files?: Array<{ name: string; action: "created" | "updated" | "modified" | "deleted" }>;
  steps?: ExecutionStep[];
}

interface ChatSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (prompt: string) => void;
  isGenerating: boolean;
  onNewChat: () => void;
  onResetChat: () => void;
  onSelectFile?: (filePath: string) => void;
  onViewCode?: () => void;
  onDownloadZip?: () => void;
  selectedModel: string;
  onModelChange?: (model: string) => void;
  currentSteps?: ExecutionStep[];
  agentThoughts?: string[];
  activeCommand?: string | null;
}

const DEFAULT_SUGGESTIONS = [
  "Add interactive testimonials carousel",
  "Add dark mode glowing toggle",
  "Add Stripe checkout pricing table",
  "Include animated FAQ accordion",
];

export function ChatSidebar({
  messages,
  onSendMessage,
  isGenerating,
  onNewChat,
  onResetChat,
  onSelectFile,
  onViewCode,
  onDownloadZip,
  selectedModel,
  currentSteps = [],
  agentThoughts = [],
  activeCommand,
}: ChatSidebarProps) {
  const [inputPrompt, setInputPrompt] = React.useState("");
  const [copiedMsgId, setCopiedMsgId] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isGenerating) return;
    onSendMessage(inputPrompt.trim());
    setInputPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEnhancePrompt = () => {
    if (!inputPrompt.trim()) {
      setInputPrompt(
        "Build a modern high-conversion SaaS landing page with dark mode, interactive pricing cards, and a live contact form with Tailwind CSS."
      );
      return;
    }
    setInputPrompt(
      (prev) =>
        `${prev.trim()} Ensure smooth micro-animations, glassmorphism card styling, responsive mobile layout, and clean TypeScript code.`
    );
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentSteps, isGenerating]);

  return (
    <div className="flex h-full w-full flex-col bg-card/60 border-r border-border/80 backdrop-blur-sm select-none">
      {/* Sidebar Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/80 px-3.5 bg-card/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
            <Bot className="h-4 w-4 text-primary" />
            <span className="font-semibold">AI Assistant</span>
          </div>
          <Badge variant="violet" className="text-[10px] py-0 px-2 font-mono">
            {selectedModel === "claude-3-7" ? "Claude 3.7" : "Claude 3.5"}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content="New Prompt Session">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onNewChat}
              aria-label="New chat session"
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Reset Conversation">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onResetChat}
              aria-label="Reset conversation"
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 select-text">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2.5 text-xs md:text-sm animate-fade-in ${
              message.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            {message.sender === "assistant" ? (
              <Avatar fallback="AI" size="sm" isAI className="mt-0.5 shrink-0" />
            ) : (
              <Avatar fallback="MI" size="sm" className="mt-0.5 shrink-0" />
            )}

            {/* Bubble */}
            <div
              className={`max-w-[88%] rounded-xl p-3 shadow-xs transition-all ${
                message.sender === "user"
                  ? "bg-primary/15 border border-primary/25 text-foreground"
                  : "bg-card border border-border text-card-foreground"
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1.5">
                <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase font-mono">
                  {message.sender === "user" ? "You" : "BYT Engine"}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                  <span>{message.timestamp}</span>
                  <button
                    onClick={() => handleCopyMessage(message.content, message.id)}
                    className="hover:text-foreground p-0.5"
                    title="Copy message"
                  >
                    {copiedMsgId === message.id ? (
                      <Check className="h-2.5 w-2.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-2.5 w-2.5" />
                    )}
                  </button>
                </div>
              </div>

              <p className="leading-relaxed text-xs md:text-sm whitespace-pre-wrap">
                {message.content}
              </p>

              {/* Modified Workspace Files Pill */}
              {message.files && message.files.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Applied File Changes</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    {message.files.map((file) => (
                      <div
                        key={file.name}
                        onClick={() => onSelectFile && onSelectFile(file.name)}
                        className="flex items-center justify-between rounded bg-muted/40 px-2.5 py-1 text-[11px] font-mono text-foreground border border-border/40 hover:border-primary/50 hover:bg-muted/70 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <FileCode2 className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <span className="text-[9px] uppercase font-semibold text-muted-foreground ml-2">
                          {file.action}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {onViewCode && (
                      <button
                        onClick={() => {
                          if (message.files && message.files.length > 0 && onSelectFile) {
                            onSelectFile(message.files[0].name);
                          }
                          onViewCode();
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 text-[11px] font-medium transition-colors"
                      >
                        <Code2 className="h-3 w-3" />
                        <span>View Code</span>
                      </button>
                    )}
                    {onDownloadZip && (
                      <button
                        onClick={onDownloadZip}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-[11px] font-medium transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download ZIP</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Real-time Activity Streamer during Generation */}
        {(currentSteps && currentSteps.length > 0) || agentThoughts.length > 0 ? (
          <div className="pt-1">
            <ActivityStreamer
              steps={currentSteps}
              isGenerating={isGenerating}
              onViewDiff={(file) => onSelectFile && onSelectFile(file)}
              agentThoughts={agentThoughts}
              activeCommand={activeCommand}
            />
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 py-1.5 border-t border-border/40 bg-card/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1 font-medium">
          <Sparkles className="h-3 w-3 text-primary" /> Ideas:
        </span>
        {DEFAULT_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setInputPrompt(suggestion)}
            className="whitespace-nowrap rounded-full border border-border/70 bg-secondary/50 px-2.5 py-0.5 text-[10px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Bottom Prompt Engine */}
      <div className="p-3 border-t border-border/80 bg-card/80">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-xl border border-border bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40 transition-all shadow-sm"
        >
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to build, edit, or style anything..."
            rows={2}
            className="w-full resize-none bg-transparent px-3 py-2 text-xs md:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />

          {/* Action Row */}
          <div className="flex items-center justify-between border-t border-border/40 px-2.5 py-1.5 bg-muted/20">
            <div className="flex items-center gap-1">
              <Tooltip content="Enhance prompt with AI">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleEnhancePrompt}
                  aria-label="Enhance prompt"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>

              <Tooltip content="Attach image or screenshot">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Attach file"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>

              <Tooltip content="Voice prompt">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Voice prompt"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Mic className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[10px] text-muted-foreground font-mono">
                Enter ↵
              </span>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!inputPrompt.trim() || isGenerating}
                className="h-7 px-3 gap-1.5 text-xs font-semibold"
              >
                <span>Generate</span>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </form>

        {/* Legal Disclaimer & Protection Note */}
        <p className="mt-2 text-[10px] text-center text-muted-foreground/70 select-none">
          Generated applications comply with our{" "}
          <Link href="/terms" className="underline hover:text-primary transition-colors">Terms</Link>
          {" & "}
          <Link href="/privacy" className="underline hover:text-primary transition-colors">Privacy</Link>.
        </p>
      </div>
    </div>
  );
}
