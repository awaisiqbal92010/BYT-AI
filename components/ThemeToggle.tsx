"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className="text-muted-foreground"
      >
        <span className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <Tooltip content={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="relative text-muted-foreground hover:text-foreground"
      >
        <Sun
          className={`h-4 w-4 transition-all duration-200 ${
            isDark ? "-rotate-90 scale-0 opacity-0 absolute" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <Moon
          className={`h-4 w-4 transition-all duration-200 ${
            isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0 absolute"
          }`}
        />
      </Button>
    </Tooltip>
  );
}
