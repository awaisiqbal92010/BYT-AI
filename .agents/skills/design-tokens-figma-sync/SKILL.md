---
name: design-tokens-figma-sync
description: W3C Community Group design token format, Style Dictionary compilation, CSS variables, and Figma API sync.
---

# Design Tokens & Figma Synchronization

## Token Architecture
- **Global Tokens**: Raw values (e.g., `color.blue.500: #3b82f6`).
- **Semantic Tokens**: Intent-based aliases (e.g., `color.interactive.primary: {color.blue.500}`).
- **Component Tokens**: Scoped overrides (e.g., `button.primary.bg: {color.interactive.primary}`).
- **Export Pipeline**: Compile JSON tokens to CSS custom variables via Tailwind theme configuration.

