---
name: micro-animations-framer-motion
description: Techniques for crafting micro-interactions, smooth scale transitions, and entrance animations in React apps.
---

# Micro-Animations & Framer Motion Skill

Use this skill when adding interactive transitions, button feedback, and entrance animations to React components.

## Guidelines

1. **Button & Click Physics**
   - Active press scale: `active:scale-95 transition-transform duration-150`
   - Hover elevation: `hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200`

2. **Fade-In & Staggered Transitions**
   - Use CSS keyframe animations for lightweight entrances:
     ```css
     @keyframes fadeIn {
       from { opacity: 0; transform: translateY(6px); }
       to { opacity: 1; transform: translateY(0); }
     }
     .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
     ```

3. **Status Indicators**
   - Pulsing badges: `relative flex h-2 w-2` with `animate-ping` pinging behind a solid dot.
