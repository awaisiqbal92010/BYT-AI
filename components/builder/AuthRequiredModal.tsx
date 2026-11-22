"use client";

import * as React from "react";
import { Lock, Sparkles, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthRequiredModal({ isOpen, onClose }: AuthRequiredModalProps) {
  const router = useRouter();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Authentication Required" maxWidth="sm">
      <div className="space-y-5 p-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
          <Lock className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            <span>Account Required</span>
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Sign In to Build Your Website
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            To prevent bot abuse and protect sandbox resources, please sign in or create an account before building.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => router.push("/login")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all"
          >
            <span>Continue to Sign In / Sign Up</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-xl border border-border py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Strict Bot & Disposable Email Protection Active</span>
        </div>
      </div>
    </Modal>
  );
}
