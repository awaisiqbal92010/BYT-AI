"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log crash diagnostics to telemetry / server logs
    console.error("[BYT App Error Boundary Caught]:", {
      message: error?.message,
      stack: error?.stack,
      digest: error?.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 text-foreground selection:bg-primary/20">
      <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive ring-1 ring-destructive/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Something went wrong
            </h2>
            <p className="text-xs text-muted-foreground">
              An unexpected runtime error was caught safely.
            </p>
          </div>
        </div>

        {error?.message && (
          <div className="mt-4 rounded-lg border border-border/60 bg-muted/50 p-3 font-mono text-xs text-muted-foreground break-all">
            <div className="flex items-center gap-1.5 text-destructive font-semibold mb-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Crash Diagnostic:</span>
            </div>
            {error.message}
            {error.digest && (
              <div className="mt-1 text-[10px] text-zinc-500">
                Digest: {error.digest}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={() => reset()}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/60 px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted active:scale-95 transition-all"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
