import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "violet-subtle" | "danger";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "default", ...props }, ref) => {
    const variantStyles = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 active:scale-[0.98]",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 active:scale-[0.98]",
      outline:
        "border border-border bg-transparent text-foreground hover:bg-muted/70 active:scale-[0.98]",
      ghost:
        "text-muted-foreground hover:text-foreground hover:bg-muted/70",
      "violet-subtle":
        "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 active:scale-[0.98]",
      danger:
        "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 active:scale-[0.98]",
    };

    const sizeStyles = {
      default: "h-9 px-3.5 py-2 text-sm",
      sm: "h-7 px-2.5 text-xs font-medium",
      lg: "h-10 px-5 text-sm font-medium",
      icon: "h-8 w-8 p-0 flex items-center justify-center",
      "icon-sm": "h-7 w-7 p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "disabled:pointer-events-none disabled:opacity-50 select-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
