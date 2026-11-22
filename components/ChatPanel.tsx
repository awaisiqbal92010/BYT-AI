"use client";

import * as React from "react";
import {
  Sparkles,
  Send,
  Paperclip,
  Wand2,
  FileCode2,
  CheckCircle2,
  CornerDownLeft,
  RotateCcw,
  Bot,
  User,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";

interface Message {
  id: string;
  sender: "user" | "assistant";
  timestamp: string;
  content: string;
  files?: Array<{ name: string; action: "created" | "updated" }>;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "user",
    timestamp: "Just now",
    content:
      "Build a modern SaaS landing page for an AI developer platform with dark mode, interactive pricing tiers, and a feature grid.",
  },
  {
    id: "2",
    sender: "assistant",
    timestamp: "Just now",
    content:
      "I've generated the scaffolded project with a clean hero section, interactive pricing calculator, and feature breakdown cards.",
    files: [
      { name: "components/HeroSection.tsx", action: "created" },
      { name: "components/PricingCards.tsx", action: "created" },
      { name: "app/page.tsx", action: "updated" },
    ],
  },
  {
    id: "3",
    sender: "user",
    timestamp: "Just now",
    content:
      "Make the pricing cards have a glassmorphism hover effect and add a glowing 'Most Popular' badge on the Pro tier.",
  },
  {
    id: "4",
    sender: "assistant",
    timestamp: "Just now",
    content:
      "Updated `PricingCards.tsx` with animated glass hover borders, glowing violet badges, and smooth scale transitions. Check out the live preview on the right!",
    files: [{ name: "components/PricingCards.tsx", action: "updated" }],
  },
];

const SUGGESTIONS = [
  "Add client testimonials carousel",
  "Include animated FAQ accordion",
  "Add dark/light theme switch",
];

export function ChatPanel() {
  const [messages] = React.useState<Message[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = React.useState("");

  return (
    <div className="flex h-full flex-col bg-card/40 backdrop-blur-sm">
      {/* Panel Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/80 px-4 bg-card/60">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
            <Bot className="h-3.5 w-3.5 text-primary" />
            <span>AI Assistant</span>
          </div>
          <Badge variant="violet" className="text-[10px] py-0 px-2 font-mono">
            OX Alpha
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content="New chat session">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="New chat session"
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Reset conversation">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Reset conversation"
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 text-sm animate-fade-in ${
              message.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            {message.sender === "assistant" ? (
              <Avatar fallback="AI" size="sm" isAI className="mt-0.5" />
            ) : (
              <Avatar fallback="MI" size="sm" className="mt-0.5" />
            )}

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-lg p-3.5 shadow-sm transition-all ${
                message.sender === "user"
                  ? "bg-primary/10 border border-primary/20 text-foreground"
                  : "bg-card border border-border text-card-foreground"
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1.5">
                <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                  {message.sender === "user" ? "You" : "Forge Engine"}
                </span>
                <span className="text-[10px] text-muted-foreground/70">
                  {message.timestamp}
                </span>
              </div>

              <p className="leading-relaxed text-xs md:text-sm whitespace-pre-wrap">
                {message.content}
              </p>

              {/* Generated Files / Artifacts Pill */}
              {message.files && message.files.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Modified workspace files</span>
                  </div>
                  <div className="space-y-1 pl-1">
                    {message.files.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between rounded bg-muted/50 px-2 py-1 text-[11px] font-mono text-foreground/90 border border-border/40"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <FileCode2 className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                          {file.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 border-t border-border/40 bg-card/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" /> Suggestions:
        </span>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setInputPrompt(suggestion)}
            className="whitespace-nowrap rounded-md border border-border/70 bg-secondary/50 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 border-t border-border/80 bg-card/60">
        <div className="relative rounded-lg border border-border bg-background focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/40 transition-all shadow-sm">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask AI to edit or build anything..."
            rows={2}
            className="w-full resize-none bg-transparent px-3.5 py-2.5 text-xs md:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />

          {/* Action Row */}
          <div className="flex items-center justify-between border-t border-border/50 px-2.5 py-1.5 bg-card/30">
            <div className="flex items-center gap-1">
              <Tooltip content="Attach image or asset">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Attach file"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
              <Tooltip content="Enhance prompt with AI">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Enhance prompt"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex text-[10px] text-muted-foreground items-center gap-0.5">
                <CornerDownLeft className="h-2.5 w-2.5" /> Enter to send
              </span>
              <Button
                variant="primary"
                size="sm"
                className="h-7 px-2.5 gap-1 text-xs"
                aria-label="Send message"
              >
                <span>Generate</span>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
