"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LegacyProjectRedirect() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  React.useEffect(() => {
    const id = params?.id as string;
    if (!id) {
      router.replace("/");
      return;
    }

    const prompt = searchParams?.get("prompt");
    const fw = searchParams?.get("framework");

    // If legacy URL had prompt, store in sessionStorage so URL remains compact
    if (prompt && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "byt_pending_build",
          JSON.stringify({ prompt, framework: fw || "Vite + React", projectId: id })
        );
      } catch (e) {
        console.warn("Error storing pending build", e);
      }
    }

    // Redirect to compact URL without any bulky query strings
    router.replace(`/apps/${id}/editor/preview`);
  }, [params, searchParams, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Opening project workspace...</span>
      </div>
    </div>
  );
}
