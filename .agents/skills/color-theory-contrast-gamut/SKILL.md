---
name: color-theory-contrast-gamut
description: OKLCH color space, P3 gamut palettes, perceptual lightness uniformity, and dark-mode luminance tiers.
---

# Color Theory & Wide Gamut (OKLCH / Display P3)

## Color Engineering
1. **Perceptual Uniformity**: Use OKLCH color space (`oklch(L C H)`) so lightness adjustments don't distort hues.
2. **Dark Mode Tiers**:
   - Background: `zinc-950` or `#09090b`
   - Card Surface: `zinc-900/80` with `border-zinc-800/60`
   - Elevated Dialogs: `zinc-800`
3. **Accent Contrast**: Never use saturated pure yellow or cyan text on light backgrounds without dark borders.

