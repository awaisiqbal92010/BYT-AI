# Graph Report - BYT  (2026-10-10)

## Corpus Check
- 173 files · ~86,633 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 979 nodes · 1678 edges · 110 communities (46 shown, 64 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `051a7561`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- badge.tsx
- project-storage.ts
- sandbox.ts
- hugeicons.tsx
- debugger.ts
- getAdminDb
- dependencies
- compilerOptions
- Navbar.tsx
- devDependencies
- declarations.d.ts
- manifest.json
- projects/page.tsx
- deployments/page.tsx
- Agent tasks
- auth-context.tsx
- firebase.ts
- cookies/page.tsx
- 6A tasks
- Supabase
- Changelog
- builder/[id]/page.tsx
- Changelog
- Writing Guidelines for Postgres References
- sandbox-tests.ts
- (dashboard)/page.tsx
- next.config.mjs
- postcss.config.mjs
- tailwind.config.ts
- FileTreeExplorer.tsx
- orchestrator.ts
- generate/route.ts
- Section Definitions
- Phase 0 — Security Audit Report
- BYT — Agent Operating Rules
- Supabase Postgres Best Practices
- connect/route.ts
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
- WorkbenchHeader.tsx
- supabase/types.ts
- appetize.ts
- ChatSidebar.tsx
- modal.tsx
- Zap
- migrate-supabase-to-firestore.mjs
- logout/route.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 32 edges
2. `Badge()` - 25 edges
3. `Button` - 22 edges
4. `getAdminDb()` - 19 edges
5. `verifySessionCookie()` - 19 edges
6. `compilerOptions` - 17 edges
7. `6A tasks` - 15 edges
8. `Tooltip()` - 14 edges
9. `getSavedProjects()` - 13 edges
10. `Zap` - 12 edges

## Surprising Connections (you probably didn't know these)
- `BuilderPage()` --calls--> `duplicateProject()`  [EXTRACTED]
  app/(dashboard)/page.tsx → lib/project-storage.ts
- `BuilderPage()` --calls--> `getProjectById()`  [EXTRACTED]
  app/(dashboard)/page.tsx → lib/project-storage.ts
- `BuilderPage()` --calls--> `saveProject()`  [EXTRACTED]
  app/(dashboard)/page.tsx → lib/project-storage.ts
- `ProjectBuilderPage()` --calls--> `downloadProjectAsZip()`  [EXTRACTED]
  app/(dashboard)/project/[id]/page.tsx → lib/export-zip.ts
- `ProjectBuilderPage()` --calls--> `useAuth()`  [EXTRACTED]
  app/(dashboard)/project/[id]/page.tsx → lib/firebase/auth-context.tsx

## Import Cycles
- None detected.

## Communities (110 total, 64 thin omitted)

### Community 0 - "badge.tsx"
Cohesion: 0.08
Nodes (27): Checkpoint, CHECKPOINTS, ActivityStreamerProps, ANDROID_DEVICES, AppetizeEmulator(), AppetizeEmulatorProps, IOS_DEVICES, LivePreviewFile (+19 more)

### Community 1 - "project-storage.ts"
Cohesion: 0.18
Nodes (19): convertFlatFilesToFileTree(), findFileInTree(), ProjectBuilderPage(), load(), ProjectsPage(), StandalonePreviewContent(), CLONE_EXAMPLES, IdeaPromptHero() (+11 more)

### Community 2 - "sandbox.ts"
Cohesion: 0.14
Nodes (20): dynamic, POST(), dynamic, POST(), dynamic, POST(), activeSandboxes, CommandResult (+12 more)

### Community 3 - "hugeicons.tsx"
Cohesion: 0.05
Nodes (46): INITIAL_LOGS, TerminalDrawerProps, AlertTriangle, ArrowDown, ArrowUp, BarChart3, Box, Brain (+38 more)

### Community 4 - "debugger.ts"
Cohesion: 0.19
Nodes (16): generateFileContent(), getCodegenSystemPrompt(), stripMarkdownFences(), attemptFix(), DebuggerResult, FileFix, parseDebuggerOutput(), FilePlan (+8 more)

### Community 5 - "getAdminDb"
Cohesion: 0.09
Nodes (43): POST(), runtime, DELETE(), dynamic, GET(), PUT(), resolveUid(), RouteParams (+35 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (35): clsx, @e2b/code-interpreter, firebase, firebase-admin, @hugeicons/core-free-icons, @hugeicons/react, jszip, lucide-react (+27 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (28): declarations.d.ts, dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+20 more)

### Community 8 - "Navbar.tsx"
Cohesion: 0.13
Nodes (18): CommandItem, CommandPalette(), CommandPaletteProps, ArrowRight, Bot, ChevronDown, Code, CreditCard (+10 more)

### Community 9 - "devDependencies"
Cohesion: 0.07
Nodes (28): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+20 more)

### Community 10 - "declarations.d.ts"
Cohesion: 0.11
Nodes (11): AppRouterInstance, LinkProps, Metadata, next, next/dist/lib/metadata/types/metadata-interface.js, next/dist/lib/metadata/types/metadata-types.js, next/link, next/navigation (+3 more)

### Community 11 - "manifest.json"
Cohesion: 0.11
Nodes (17): background_color, categories, description, display, icons, lang, name, orientation (+9 more)

### Community 12 - "projects/page.tsx"
Cohesion: 0.12
Nodes (22): INITIAL_PROJECTS, Project, ArrowUpRight, Card(), CardContent(), CardDescription(), CardFooter(), CardHeader() (+14 more)

### Community 13 - "deployments/page.tsx"
Cohesion: 0.09
Nodes (21): Deployment, DEPLOYMENTS, DnsRecord, EnvVar, INITIAL_DNS_RECORDS, INITIAL_ENV_VARS, PreviewFile, AlertCircle (+13 more)

### Community 14 - "Agent tasks"
Cohesion: 0.09
Nodes (22): A1 — Read-only audit → `docs/security/phase-0-audit.md`, A2 — Repo hygiene, A3 — Env validation (`lib/env.ts`, `lib/env.server.ts`), A4 — Lock down the admin client, A5 — RLS audit script (`supabase/verification/rls_audit.sql`), A6 — Prevent recurrence, A7 — E2B sandbox exposure review, Acceptance criteria (+14 more)

### Community 15 - "auth-context.tsx"
Cohesion: 0.09
Nodes (30): jetbrainsMono, metadata, plusJakartaSans, LoginPage(), clearMessages(), handleEmailAuth(), handleGithubSignIn(), handleGoogleSignIn() (+22 more)

### Community 16 - "firebase.ts"
Cohesion: 0.15
Nodes (6): app, auth, db, firebaseConfig, githubProvider, googleProvider

### Community 17 - "cookies/page.tsx"
Cohesion: 0.10
Nodes (7): metadata, metadata, metadata, ArrowLeft, Cookie, Scale, ShieldCheck

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

### Community 24 - "sandbox-tests.ts"
Cohesion: 0.17
Nodes (13): dynamic, FORBIDDEN_COMMAND_PATTERNS, POST(), HARDCODED_EXPO_FILES, HARDCODED_NEXTJS_FILES, HARDCODED_TEST_FILES, isDangerousCommand(), runCommandInSandbox() (+5 more)

### Community 25 - "(dashboard)/page.tsx"
Cohesion: 0.15
Nodes (24): BuilderPage(), convertFlatFilesToFileTree(), findFileInTree(), ExecutionStep, AuthRequiredModal(), ChatMessage, ChatSidebar(), CodeEditorView() (+16 more)

### Community 31 - "FileTreeExplorer.tsx"
Cohesion: 0.15
Nodes (13): countFiles(), FileTreeExplorer(), FileTreeExplorerProps, ChevronRight, Edit2, FileCode2, FileJson, FilePlus (+5 more)

### Community 32 - "orchestrator.ts"
Cohesion: 0.25
Nodes (11): BuildPlan, cleanJsonString(), generatePlan(), getSystemPromptForFramework(), PlanOptions, buildStitchDesignInstructions(), DEFAULT_TOKENS, generateStitchBlueprint() (+3 more)

### Community 33 - "generate/route.ts"
Cohesion: 0.21
Nodes (10): maxDuration, POST(), runtime, ActiveSandboxEntry, bootSandboxDevServer(), extractImportedPackages(), getPortForFramework(), PROJECT_DIR (+2 more)

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

### Community 38 - "connect/route.ts"
Cohesion: 0.67
Nodes (3): dynamic, POST(), reconnectToSandbox()

### Community 99 - "WorkbenchHeader.tsx"
Cohesion: 0.09
Nodes (25): Template, TEMPLATES, BlockItem, BLOCKS, ComponentInserterModalProps, WorkbenchHeader(), WorkbenchHeaderProps, Check (+17 more)

### Community 100 - "supabase/types.ts"
Cohesion: 0.13
Nodes (14): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Deployment, Enums, Json (+6 more)

### Community 101 - "appetize.ts"
Cohesion: 0.21
Nodes (11): dynamic, GET(), AppetizeApp, AppetizeEmbedConfig, AppetizeUploadResult, deleteApp(), generateEmbedConfig(), getApiKey() (+3 more)

### Community 102 - "ChatSidebar.tsx"
Cohesion: 0.17
Nodes (11): ActivityStreamer(), ChatSidebarProps, DEFAULT_SUGGESTIONS, Cpu, Download, Mic, Paperclip, RotateCcw (+3 more)

### Community 103 - "modal.tsx"
Cohesion: 0.27
Nodes (6): AuthRequiredModalProps, StitchKeyModalProps, Input, InputProps, Modal(), ModalProps

### Community 104 - "Zap"
Cohesion: 0.22
Nodes (5): metadata, CheckCircle2, ShieldAlert, XCircle, Zap

## Knowledge Gaps
- **417 isolated node(s):** `extends`, `next/core-web-vitals`, `Deployment`, `EnvVar`, `DEPLOYMENTS` (+412 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **64 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `verifySessionCookie()` connect `getAdminDb` to `sandbox-tests.ts`, `generate/route.ts`, `appetize.ts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `getAdminDb()` connect `getAdminDb` to `generate/route.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `cn()` connect `projects/page.tsx` to `badge.tsx`, `modal.tsx`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `extends`, `next/core-web-vitals`, `Deployment` to the rest of the system?**
  _417 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `badge.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08478513356562137 - nodes in this community are weakly interconnected._
- **Should `sandbox.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13666666666666666 - nodes in this community are weakly interconnected._
- **Should `hugeicons.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05187074829931973 - nodes in this community are weakly interconnected._