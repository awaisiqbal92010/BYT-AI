---
name: tailwind-design-system
description: Best practices for configuring and applying Tailwind CSS design systems, utility patterns, and theme extensions.
---

# Tailwind Design System Skill

Use this skill when implementing Tailwind CSS styling, responsive layout utilities, and custom design tokens.

## Rules & Utilities

1. **Semantic Color Tokens**
   - Rely on semantic variables (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-primary`) rather than hardcoding arbitrary hex colors across JSX.
   - Support dark mode automatically via `dark:` class variants or CSS custom properties.

2. **Spacing and Typography Rhythm**
   - Headings: `text-2xl font-bold tracking-tight md:text-3xl`
   - Subheadings: `text-sm text-muted-foreground leading-relaxed`
   - Interactive buttons: `px-4 py-2 text-xs font-semibold rounded-xl`

3. **Composite Utilities**
   - Use `clsx` and `tailwind-merge` (`cn(...)`) for conditional classes.
