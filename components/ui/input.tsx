import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, clearable, onClear, value, ...props }, ref) => {
    return (
      <div className="relative flex w-full items-center">
        {icon && (
          <div className="pointer-events-none absolute left-3 flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-9",
            clearable && value && "pr-8",
            className
          )}
          ref={ref}
          value={value}
          {...props}
        />
        {clearable && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            tabIndex={-1}
            aria-label="Clear input"
          >
            ×
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
