import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
  size?: "sm" | "default" | "lg";
  isAI?: boolean;
  status?: "online" | "idle" | "offline";
}

export function Avatar({
  src,
  fallback,
  size = "default",
  isAI = false,
  status,
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  const sizeStyles = {
    sm: "h-7 w-7 text-xs",
    default: "h-8 w-8 text-xs font-medium",
    lg: "h-9 w-9 text-sm font-medium",
  };

  const statusStyles = {
    online: "bg-emerald-500",
    idle: "bg-amber-500",
    offline: "bg-muted-foreground",
  };

  return (
    <div className={cn("relative inline-flex shrink-0", className)} {...props}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full border select-none overflow-hidden transition-colors",
          isAI
            ? "bg-gradient-to-tr from-violet-600 to-indigo-500 text-white border-violet-400/30 shadow-sm shadow-violet-500/20"
            : "bg-secondary text-secondary-foreground border-border/80",
          sizeStyles[size]
        )}
      >
        {src && !imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={fallback}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          fallback
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-background",
            statusStyles[status]
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
