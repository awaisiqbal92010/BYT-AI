---
name: performance-optimization-web-vitals
description: Frontend performance engineering, reducing bundle sizes, lazy loading, and optimizing Core Web Vitals (LCP, FID, CLS).
---

# Performance Optimization & Core Web Vitals Skill

Use this skill when optimizing page load speeds, reducing client JS bundles, and maximizing Core Web Vitals scores.

## Optimization Techniques

1. **Dynamic Imports & Code Splitting**
   - Use `React.lazy()` or `next/dynamic` for heavy client modules (e.g. CodeMirror, Markdown renderers, charts).

2. **Asset Loading & Layout Shift Prevention**
   - Specify explicit `width` and `height` (or aspect-ratio) on media containers to prevent Cumulative Layout Shift (CLS).

3. **Rendering Efficiency**
   - Memoize costly filtering or sorting computations with `useMemo`.
