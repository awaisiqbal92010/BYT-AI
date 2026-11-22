---
name: responsive-layouts
description: Principles for creating mobile-first, tablet, and desktop adaptive responsive grid and flexbox interfaces.
---

# Responsive Layouts Skill

Use this skill when building layouts that adapt across mobile (375px), tablet (768px), and desktop (1280px+) screens.

## Responsive Strategies

1. **Mobile-First Layouts**
   - Single column by default (`flex flex-col` or `grid grid-cols-1`).
   - Break out into multi-column on larger screens: `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.

2. **Touch Targets on Mobile**
   - Ensure interactive elements are at least 40px in height on touch devices (`h-10 px-4`).
   - Provide bottom drawer sheets or mobile hamburgers for navigation below `md` breakpoint.

3. **Viewport Container Wrapping**
   - Standard max widths: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
