---
name: web-accessibility-a11y
description: Web accessibility standards, ARIA attributes, keyboard navigation, and focus management guidelines.
---

# Web Accessibility (a11y) Skill

Use this skill when ensuring applications conform to WCAG 2.1 AA accessibility standards.

## Accessibility Principles

1. **Keyboard Navigation & Focus Management**
   - Ensure all interactive buttons, links, and inputs can be navigated via `Tab` key.
   - Visible focus outlines using `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`.

2. **Screen Reader Attributes**
   - Provide `aria-label` for icon-only buttons (e.g. `<button aria-label="Close modal">`).
   - Use `aria-expanded` on accordion dropdowns and disclosure menus.

3. **Color Contrast**
   - Maintain minimum 4.5:1 text-to-background contrast for body text and 3:1 for large text and UI components.
