---
name: nextjs-app-router-patterns
description: Guidelines for structuring Next.js 14 App Router applications, layouts, route groups, and server/client components.
---

# Next.js App Router Patterns Skill

Use this skill when building routes and components with Next.js 14 App Router.

## App Router Rules

1. **Server vs Client Boundary**
   - By default, components in `app/` are Server Components.
   - Add `"use client";` at the top of files that use React hooks (`useState`, `useEffect`, `useRef`), browser APIs, or event handlers (`onClick`, `onChange`).

2. **Route Groups & Layouts**
   - Use parenthesis folders `(dashboard)`, `(auth)` to organize routes without affecting the URL path.
   - Place shared navigational headers and drawers in `layout.tsx`.

3. **Metadata & Head**
   - Export `metadata: Metadata` object from Server Component pages for SEO titles, descriptions, and OpenGraph tags.
