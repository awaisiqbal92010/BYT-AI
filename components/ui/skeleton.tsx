import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/60 relative overflow-hidden",
        shimmer ? "animate-pulse" : "",
        className
      )}
      {...props}
    >
      {shimmer && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      )}
    </div>
  );
}

/**
 * Skeleton for Project Cards in the Dashboard / Projects page
 */
export function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-5 w-5 rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Skeleton for File Tree view
 */
export function FileTreeSkeleton() {
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="pl-4 space-y-2 border-l border-border/30">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Code Editor view
 */
export function EditorSkeleton() {
  return (
    <div className="h-full w-full bg-zinc-950 p-4 space-y-3 font-mono">
      <div className="flex space-x-2 border-b border-zinc-800 pb-2">
        <Skeleton className="h-6 w-24 rounded" />
        <Skeleton className="h-6 w-28 rounded" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-1/3 bg-zinc-900" />
        <Skeleton className="h-4 w-1/2 bg-zinc-900" />
        <Skeleton className="h-4 w-2/3 bg-zinc-900" />
        <Skeleton className="h-4 w-1/4 bg-zinc-900" />
        <Skeleton className="h-4 w-3/4 bg-zinc-900" />
        <Skeleton className="h-4 w-2/5 bg-zinc-900" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Live Preview sandbox
 */
export function PreviewSkeleton() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-950/80 p-8 space-y-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="w-full max-w-md space-y-2 pt-4">
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}
