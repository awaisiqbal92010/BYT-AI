"use client";

import * as React from "react";
import { Sparkles, Key, CheckCircle2, ShieldCheck, ExternalLink, Sliders, Zap } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface StitchKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey?: (apiKey: string) => void;
}

export function StitchKeyModal({ isOpen, onClose, onSaveKey }: StitchKeyModalProps) {
  const [apiKey, setApiKey] = React.useState("");
  const [isSaved, setIsSaved] = React.useState(false);
  const [enabled, setEnabled] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("byt_stitch_api_key") || "";
      const storedEnabled = localStorage.getItem("byt_stitch_enabled") !== "false";
      setApiKey(storedKey);
      setEnabled(storedEnabled);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("byt_stitch_api_key", apiKey.trim());
      localStorage.setItem("byt_stitch_enabled", enabled ? "true" : "false");
    }
    if (onSaveKey) {
      onSaveKey(apiKey.trim());
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("byt_stitch_api_key");
    }
    setApiKey("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stitch MCP UI Design Engine"
      description="Connect your Stitch API key to enable AI-powered UI blueprints, design tokens, and wireframes before code generation."
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Stitch MCP Integration</span>
            </div>
            <Badge variant="violet" className="text-[10px]">
              AI Design Token System
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When enabled, BYT agent consults Stitch MCP to architect wireframes, visual harmonies, and glassmorphism styling specs for your prompt before writing React code.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-muted-foreground" />
              Stitch API Key
            </span>
            <span className="text-[11px] text-muted-foreground">Stored securely in your local browser</span>
          </label>
          <Input
            type="password"
            placeholder="st_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-card/60">
          <div>
            <div className="text-xs font-semibold text-foreground">Enable Stitch Design Mode</div>
            <div className="text-[11px] text-muted-foreground">Auto-generate UI wireframes on every build</div>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 rounded accent-primary cursor-pointer"
          />
        </div>

        {isSaved && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Stitch API Key & settings saved successfully!</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-muted-foreground">
            Clear Key
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="gap-1.5 font-semibold"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Save & Enable Stitch</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
