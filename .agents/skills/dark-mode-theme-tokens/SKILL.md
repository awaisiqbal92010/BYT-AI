---
name: dark-mode-theme-tokens
description: Seamless light/dark mode theming, next-themes integration, CSS variables, and zero-flash theme persistence.
---

# Dark Mode & Theme Tokens Skill

Use this skill when implementing theme toggles, CSS variable mappings, and smooth theme switching without page flash.

## Implementation Details

1. **next-themes Integration**
   - Wrap application root with `<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>`.
   - Prevent SSR hydration mismatch by suppressing hydration warning on `<html>`.

2. **CSS Custom Properties Mapping**
   - Define color tokens in `globals.css` for both `:root` (light) and `.dark` (dark):
     - `--background`, `--foreground`, `--card`, `--border`, `--primary`, `--muted-foreground`.
