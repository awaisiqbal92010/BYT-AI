import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "violet" | "success" | "warning";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-secondary text-secondary-foreground border-border/60",
    secondary: "bg-muted text-muted-foreground border-transparent",
    outline: "bg-transparent text-foreground border-border",
    violet: "bg-primary/10 text-primary border-primary/20",
    success: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20",
  };

  const dotColors = {
    default: "bg-muted-foreground",
    secondary: "bg-muted-foreground",
    outline: "bg-muted-foreground",
    violet: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full animate-pulse", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}
