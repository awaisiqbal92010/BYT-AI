---
name: modern-web-architecture
description: Architectural principles for building high-performance, modular Vite, Next.js, and React web applications.
---

# Modern Web Architecture Skill

Use this skill when architecting modern frontend and full-stack web applications.

## Core Architectural Principles

1. **Modular Component Hierarchy**
   - Separate presentational components (`components/ui/`) from container/stateful components (`components/features/`).
   - Keep components focused on a single responsibility with clean props interfaces.
   - Avoid monolithic files exceeding 300 lines of code.

2. **Directory Structure Standard**
   ```
   src/
   ├── components/
   │   ├── ui/          # Generic atomic components (Buttons, Modals, Badges)
   │   └── layout/      # Navbar, Sidebar, Footer, Containers
   ├── hooks/           # Custom React hooks
   ├── lib/             # Utilities, API clients, helpers
   ├── types/           # TypeScript interfaces & types
   ├── App.jsx / App.tsx
   └── main.jsx / main.tsx
   ```

3. **Entry Point Integrity**
   - Ensure `index.html` contains the root mount `#root` and modern viewport metadata.
   - Configure Vite dev server with `allowedHosts: true` and `host: "0.0.0.0"` for seamless sandbox compatibility.
