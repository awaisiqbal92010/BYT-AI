"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[BYT Global Fatal Error]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 px-4 text-slate-100 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900/90 p-8 shadow-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-400 mb-4 ring-1 ring-red-500/30">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mb-2">
            Critical System Interruption
          </h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            The application encountered an unhandled exception. The crash isolation system prevented data corruption.
          </p>

          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-violet-500 active:scale-95 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
