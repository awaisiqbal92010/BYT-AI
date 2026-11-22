---
name: mobile-first-touch-gestures
description: Touch target sizing (48x48px), pull-to-refresh, bottom sheets, edge swipes, and thumb-zone layout.
---

# Mobile-First Touch & Gesture Ergonomics

## Guidelines
- **Touch Target Minimum**: 48x48 CSS pixels for all clickable interactive surfaces (`min-h-[48px] min-w-[48px]`).
- **Thumb Zone Design**: Place primary action CTAs and navigation tabs within bottom 35% of the mobile viewport.
- **Scroll Bouncing & Overscroll**: Use `overscroll-behavior-y: contain` to prevent browser pull-to-refresh conflicts.
- **Safe Area Insets**: Respect `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` on notched mobile screens.

