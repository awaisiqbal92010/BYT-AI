---
name: accessibility-wcag-aaa
description: Contrast ratios 7:1, screen reader ARIA landmarks, focus-visible outlines, and reduced motion queries.
---

# Enterprise Web Accessibility (WCAG 2.2 AAA)

## Standards
1. **Contrast Ratios**: Minimum 7:1 for normal text, 4.5:1 for large text under AAA standard.
2. **Keyboard Traps**: Ensure focus can enter and exit every interactive element using Tab / Shift+Tab.
3. **Motion Sensitivity**: Respect `prefers-reduced-motion: reduce` by zeroing transition durations.
4. **Live Regions**: Use `aria-live="polite"` for dynamic updates and `aria-live="assertive"` for errors.

