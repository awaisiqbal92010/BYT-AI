---
name: ui-ux-glassmorphism-design
description: Design principles and tokens for crafting premium glassmorphic, glowing, and modern web interfaces.
---

# UI/UX Glassmorphism Design Skill

Use this skill when designing visually captivating, premium user interfaces with modern glassmorphism, radial glow gradients, and cohesive HSL color palettes.

## Visual Styling Guidelines

1. **Frosted Glass Cards**
   - Background: `bg-card/80` or `bg-slate-900/60` with `backdrop-blur-md` or `backdrop-blur-lg`.
   - Borders: Subtle translucent borders `border border-white/10` or `border-border/70`.
   - Hover States: Add smooth glow transitions `transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10`.

2. **Glow & Radial Accents**
   - Use radial gradient spotlight backgrounds behind hero sections: `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background`.
   - Implement pulsing status dots (`animate-pulse`) and glowing badge accents.

3. **Curated Color Palettes**
   - Never use raw primary red/green/blue.
   - Use refined modern dark-mode palettes:
     - Background: `#030712` (Zinc/Slate 950)
     - Card Surface: `#0f172a` (Slate 900)
     - Primary Brand: Violet `#7c3aed`, Indigo `#6366f1`, Cyan `#06b6d4`
     - Text Primary: `#f8fafc`
     - Text Muted: `#94a3b8`
