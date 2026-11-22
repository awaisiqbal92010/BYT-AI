---
name: micro-interactions-spring-physics
description: Natural spring animations, damping ratios, gesture-driven drag, and haptic feedback simulations.
---

# Micro-Interactions & Spring Physics

## Guidelines
1. **Physics over Durations**: Use stiffness and damping (e.g. `stiffness: 300, damping: 20`) for lifelike feel.
2. **Micro-Scale Feedback**: Apply `active:scale-[0.97]` on button tap for tactile click sensation.
3. **Hover Parallax**: Subtly shift badge or specular glare relative to cursor pointer position.
4. **Zero Layout Thrashing**: Animate only composited properties: `transform` and `opacity`.

