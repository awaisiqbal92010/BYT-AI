import * as React from "react";
import { cn } from "@/lib/utils";

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Panel({ className, glass = false, children, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors",
        glass && "backdrop-blur-md bg-card/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-12 items-center justify-between border-b border-border/80 px-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function PanelContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}

export function PanelFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-border/80 p-3 bg-card/50", className)}
      {...props}
    >
      {children}
    </div>
  );
}
