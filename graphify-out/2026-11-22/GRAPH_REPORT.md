# Graph Report - BYT  (2026-10-29)

## Corpus Check
- 176 files · ~90,753 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1019 nodes · 1736 edges · 106 communities (42 shown, 64 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `051a7561`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- badge.tsx
- (dashboard)/page.tsx
- sandbox.ts
- hugeicons.tsx
- 2. Critical Security Vulnerabilities
- getAdminDb
- dependencies
- compilerOptions
- WorkbenchHeader.tsx
- devDependencies
- declarations.d.ts
- manifest.json
- cn
- deployments/page.tsx
- Agent tasks
- login/page.tsx
- firebase.ts
- Zap
- 6A tasks
- Supabase
- Changelog
- builder/[id]/page.tsx
- Changelog
- Writing Guidelines for Postgres References
- MobileAppBuildModal.tsx
- next.config.mjs
- postcss.config.mjs
- tailwind.config.ts
- FileTreeExplorer.tsx
- Section Definitions
- Phase 0 — Security Audit Report
- BYT — Agent Operating Rules
- Supabase Postgres Best Practices
- AI Agent Prompt Engineering Skill
- Component Testing & Debugging Skill
- Dark Mode & Theme Tokens Skill
- E2B Sandbox Orchestration Skill
- Forms Validation & Zod Skill
- Full-Stack API Routes Skill
- Interactive Data Visualization Skill
- Micro-Animations & Framer Motion Skill
- Modern Web Architecture Skill
- Next.js App Router Patterns Skill
- Performance Optimization & Core Web Vitals Skill
- PWA & Offline Experience Skill
- React State Management Skill
- Responsive Layouts Skill
- Security, XSS & CSRF Sanitization Skill
- SEO & Metadata Optimization Skill
- Stitch UI Prototyping Skill
- Stripe Payments & Billing Skill
- Supabase Auth & RLS Skill
- Tailwind Design System Skill
- UI/UX Glassmorphism Design Skill
- Web Accessibility (a11y) Skill
- download-apk/route.ts
- .eslintrc.json
- rules/graphify.md
- advanced-full-text-search.md
- advanced-jsonb-indexing.md
- conn-idle-timeout.md
- conn-limits.md
- conn-pooling.md
- conn-prepared-statements.md
- data-batch-inserts.md
- data-n-plus-one.md
- data-pagination.md
- data-upsert.md
- lock-advisory.md
- lock-deadlock-prevention.md
- lock-short-transactions.md
- lock-skip-locked.md
- monitor-explain-analyze.md
- monitor-pg-stat-statements.md
- monitor-vacuum-analyze.md
- query-composite-indexes.md
- query-covering-indexes.md
- query-index-types.md
- query-missing-indexes.md
- query-partial-indexes.md
- schema-constraints.md
- schema-data-types.md
- schema-foreign-key-indexes.md
- schema-lowercase-identifiers.md
- schema-partitioning.md
- schema-primary-keys.md
- security-privileges.md
- security-rls-basics.md
- security-rls-performance.md
- _template.md
- workflows/graphify.md
- supabase/types.ts
- TerminalDrawer.tsx
- ChatSidebar.tsx
- projects/page.tsx
- migrate-supabase-to-firestore.mjs
- logout/route.ts
- proxy.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 32 edges
2. `Badge()` - 25 edges
3. `Button` - 22 edges
4. `getAdminDb()` - 19 edges
5. `verifySessionCookie()` - 17 edges
6. `compilerOptions` - 17 edges
7. `6A tasks` - 15 edges
8. `Tooltip()` - 14 edges
9. `generateProjectId()` - 14 edges
10. `getSavedProjects()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `TemplatesPage()` --calls--> `generateProjectId()`  [EXTRACTED]
  app/(dashboard)/templates/page.tsx → lib/project-storage.ts
- `StandalonePreviewContent()` --calls--> `getProjectById()`  [EXTRACTED]
  app/preview/page.tsx → lib/project-storage.ts
- `AppEditorPage()` --calls--> `downloadProjectAsZip()`  [EXTRACTED]
  app/(dashboard)/apps/[id]/editor/[[...view]]/page.tsx → lib/export-zip.ts
- `BuilderPage()` --calls--> `downloadProjectAsZip()`  [EXTRACTED]
  app/(dashboard)/page.tsx → lib/export-zip.ts
- `POST()` --calls--> `getAdminDb()`  [EXTRACTED]
  app/api/generate/route.ts → lib/firebase/admin.ts

## Import Cycles
- None detected.

## Communities (106 total, 64 thin omitted)

### Community 0 - "badge.tsx"
Cohesion: 0.09
Nodes (23): Checkpoint, CHECKPOINTS, ActivityStreamerProps, ANDROID_DEVICES, AppetizeEmulator(), AppetizeEmulatorProps, IOS_DEVICES, CodeEditorView() (+15 more)

### Community 1 - "(dashboard)/page.tsx"
Cohesion: 0.12
Nodes (37): AppEditorPage(), load(), convertFlatFilesToFileTree(), findFileInTree(), BuilderPage(), convertFlatFilesToFileTree(), findFileInTree(), ProjectsPage() (+29 more)

### Community 2 - "sandbox.ts"
Cohesion: 0.05
Nodes (70): maxDuration, POST(), runtime, dynamic, POST(), dynamic, POST(), dynamic (+62 more)

### Community 3 - "hugeicons.tsx"
Cohesion: 0.06
Nodes (35): ArrowDown, ArrowUp, ArrowUpRight, BarChart3, Brain, CheckCheck, CornerDownLeft, createHugeIcon() (+27 more)

### Community 4 - "2. Critical Security Vulnerabilities"
Cohesion: 0.06
Nodes (31): 1. Executive Summary & REA Analysis Methodology, 2.1 Unauthenticated Header Spoofing & Auth Bypass (`x-firebase-uid`), 2.2 Unverified JWT Payload Decoding & Missing Middleware (`proxy.ts`), 2.3 Critical Iframe Sandbox Escape & Same-Origin XSS (`app/preview/page.tsx`), 2.4 Insecure Direct Object Reference (IDOR) & Project Overwrite (`/api/generate`), 2.5 Unauthenticated Remote Sandbox Execution & Regex Blacklist Bypass (`/api/sandbox/command`), 2.6 Unauthenticated Denial of Service / Cloud Resource Drain (`/api/sandbox/create`), 2.7 Free Privilege Escalation to "Legendary" Plan (`/api/user` & `firestore.rules`) (+23 more)

### Community 5 - "getAdminDb"
Cohesion: 0.06
Nodes (54): dynamic, GET(), POST(), runtime, DELETE(), dynamic, GET(), PUT() (+46 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (35): clsx, @e2b/code-interpreter, firebase, firebase-admin, @hugeicons/core-free-icons, @hugeicons/react, jszip, lucide-react (+27 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (29): declarations.d.ts, dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+21 more)

### Community 8 - "WorkbenchHeader.tsx"
Cohesion: 0.07
Nodes (43): Template, TEMPLATES, TemplatesPage(), BlockItem, BLOCKS, ComponentInserterModalProps, WorkbenchHeaderProps, CommandItem (+35 more)

### Community 9 - "devDependencies"
Cohesion: 0.07
Nodes (28): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+20 more)

### Community 10 - "declarations.d.ts"
Cohesion: 0.11
Nodes (11): AppRouterInstance, LinkProps, Metadata, next, next/dist/lib/metadata/types/metadata-interface.js, next/dist/lib/metadata/types/metadata-types.js, next/link, next/navigation (+3 more)

### Community 11 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, display, icons, lang, name, orientation (+9 more)

### Community 12 - "cn"
Cohesion: 0.12
Nodes (17): Avatar(), AvatarProps, Dropdown(), DropdownItem, DropdownProps, Panel(), PanelContent(), PanelFooter() (+9 more)

### Community 13 - "deployments/page.tsx"
Cohesion: 0.14
Nodes (12): Deployment, DEPLOYMENTS, DnsRecord, EnvVar, INITIAL_DNS_RECORDS, INITIAL_ENV_VARS, AlertCircle, Clock (+4 more)

### Community 14 - "Agent tasks"
Cohesion: 0.09
Nodes (22): A1 — Read-only audit → `docs/security/phase-0-audit.md`, A2 — Repo hygiene, A3 — Env validation (`lib/env.ts`, `lib/env.server.ts`), A4 — Lock down the admin client, A5 — RLS audit script (`supabase/verification/rls_audit.sql`), A6 — Prevent recurrence, A7 — E2B sandbox exposure review, Acceptance criteria (+14 more)

### Community 15 - "login/page.tsx"
Cohesion: 0.10
Nodes (29): jetbrainsMono, metadata, plusJakartaSans, LoginPage(), clearMessages(), handleEmailAuth(), handleGithubSignIn(), handleGoogleSignIn() (+21 more)

### Community 16 - "firebase.ts"
Cohesion: 0.15
Nodes (6): app, auth, db, firebaseConfig, githubProvider, googleProvider

### Community 17 - "Zap"
Cohesion: 0.08
Nodes (12): metadata, metadata, metadata, metadata, ArrowLeft, CheckCircle2, Cookie, Scale (+4 more)

### Community 18 - "6A tasks"
Cohesion: 0.09
Nodes (22): 6A.0 — Prerequisite check (report before doing anything else), 6A.10 — Preview screen, 6A.11 — Settings, 6A.12 — Deep links, 6A.13 — Docs, 6A.1 — Backend: Bearer auth, 6A.2 — Backend: resumable builds (highest risk — needs approved plan), 6A.3 — Shared package `packages/api-types` (+14 more)

### Community 19 - "Supabase"
Cohesion: 0.11
Nodes (15): Fix suggestion, Source, What happened, Skill Feedback, Steps, Core Principles, Debugging, Making and Committing Schema Changes (+7 more)

### Community 20 - "Changelog"
Cohesion: 0.12
Nodes (16): [1.2.0](https://github.com/supabase/agent-skills/compare/v1.1.1...v1.2.0) (2026-06-02), [1.3.0](https://github.com/supabase/agent-skills/compare/v1.2.0...v1.3.0) (2026-06-05), [1.4.0](https://github.com/supabase/agent-skills/compare/v1.3.0...v1.4.0) (2026-07-10), [1.5.0](https://github.com/supabase/agent-skills/compare/supabase-postgres-best-practices-v1.4.0...supabase-postgres-best-practices-v1.5.0) (2026-07-30), [1.6.0](https://github.com/supabase/agent-skills/compare/supabase-postgres-best-practices-v1.5.0...supabase-postgres-best-practices-v1.6.0) (2026-07-30), Bug Fixes, Bug Fixes, Bug Fixes (+8 more)

### Community 22 - "Changelog"
Cohesion: 0.12
Nodes (15): [0.1.3](https://github.com/supabase/agent-skills/compare/v0.1.2...v0.1.3) (2026-06-02), [0.1.4](https://github.com/supabase/agent-skills/compare/v0.1.3...v0.1.4) (2026-06-05), [0.1.5](https://github.com/supabase/agent-skills/compare/v0.1.4...v0.1.5) (2026-07-10), [0.1.6](https://github.com/supabase/agent-skills/compare/v0.1.5...supabase-v0.1.6) (2026-07-30), [0.1.7](https://github.com/supabase/agent-skills/compare/v0.1.6...supabase-v0.1.7) (2026-08-12), Bug Fixes, Bug Fixes, Bug Fixes (+7 more)

### Community 23 - "Writing Guidelines for Postgres References"
Cohesion: 0.12
Nodes (15): 1. Concrete Transformation Patterns, 2. Error-First Structure, 3. Quantified Impact, 4. Self-Contained Examples, 5. Semantic Naming, Code Example Standards, Comments, Impact Level Guidelines (+7 more)

### Community 25 - "MobileAppBuildModal.tsx"
Cohesion: 0.17
Nodes (13): AuthRequiredModal(), AuthRequiredModalProps, ExportDeployModal(), ExportDeployModalProps, MobileAppBuildModal(), MobileAppBuildModalProps, Modal(), ModalProps (+5 more)

### Community 31 - "FileTreeExplorer.tsx"
Cohesion: 0.15
Nodes (13): countFiles(), FileTreeExplorer(), FileTreeExplorerProps, ChevronRight, Edit2, FileJson, FilePlus, FileText (+5 more)

### Community 34 - "Section Definitions"
Cohesion: 0.20
Nodes (9): 1. Query Performance (query), 2. Connection Management (conn), 3. Security & RLS (security), 4. Schema Design (schema), 5. Concurrency & Locking (lock), 6. Data Access Patterns (data), 7. Monitoring & Diagnostics (monitor), 8. Advanced Features (advanced) (+1 more)

### Community 35 - "Phase 0 — Security Audit Report"
Cohesion: 0.25
Nodes (7): 1. Tracked & Historical Environment Files, 2. Environment Variables Classification, 3. Service-Role Key Usage Audit, 4. API Routes Authorization & Ownership Verification, 5. Hardcoded Secret Scan, 6. E2B Sandbox Isolation Review (Task A7), Phase 0 — Security Audit Report

### Community 36 - "BYT — Agent Operating Rules"
Cohesion: 0.33
Nodes (5): BYT — Agent Operating Rules, Conventions, Definition of done (every task), Task order, Working agreement

### Community 37 - "Supabase Postgres Best Practices"
Cohesion: 0.33
Nodes (5): How to Use, References, Rule Categories by Priority, Supabase Postgres Best Practices, When to Apply

### Community 100 - "supabase/types.ts"
Cohesion: 0.13
Nodes (14): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Deployment, Enums, Json (+6 more)

### Community 101 - "TerminalDrawer.tsx"
Cohesion: 0.10
Nodes (20): PreviewFile, StandalonePreviewContent(), INITIAL_LOGS, TerminalDrawerProps, AlertTriangle, Box, ChevronDown, ChevronUp (+12 more)

### Community 102 - "ChatSidebar.tsx"
Cohesion: 0.15
Nodes (12): ActivityStreamer(), ChatSidebarProps, DEFAULT_SUGGESTIONS, Copy, Cpu, Download, FileCode2, Mic (+4 more)

### Community 103 - "projects/page.tsx"
Cohesion: 0.21
Nodes (12): INITIAL_PROJECTS, Project, StitchKeyModal(), StitchKeyModalProps, Card(), CardContent(), CardDescription(), CardFooter() (+4 more)

### Community 110 - "proxy.ts"
Cohesion: 0.50
Nodes (4): config, decodeJwtPayload(), middleware, proxy()

## Knowledge Gaps
- **444 isolated node(s):** `extends`, `next/core-web-vitals`, `Deployment`, `EnvVar`, `DEPLOYMENTS` (+439 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **64 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `verifySessionCookie()` connect `getAdminDb` to `sandbox.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `getAdminDb()` connect `getAdminDb` to `sandbox.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `badge.tsx`, `MobileAppBuildModal.tsx`, `projects/page.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `extends`, `next/core-web-vitals`, `Deployment` to the rest of the system?**
  _444 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `badge.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0907563025210084 - nodes in this community are weakly interconnected._
- **Should `(dashboard)/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11627906976744186 - nodes in this community are weakly interconnected._
- **Should `sandbox.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05088919288645691 - nodes in this community are weakly interconnected._