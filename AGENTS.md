# BYT — Agent Operating Rules

BYT is an AI-powered website and mobile-app builder. Users describe an app in natural language; a multi-agent pipeline (planner → codegen → auto-debugger) generates it inside isolated E2B sandboxes with live preview, code editing and one-click deploy.

**Stack:** Next.js 14 (App Router) · Supabase (Postgres, Auth, RLS) · E2B sandboxes · OpenRouter → Mistral provider cascade · planned: Upstash Redis, Expo (React Native) mobile client.

> File names and line numbers mentioned in design docs may be stale. **Read the real code before trusting them.**

---

## Working agreement

1. **Explore before planning.** Read the actual code. Never invent file paths, APIs, table names or env-var names — verify by reading.
2. **Plan, then wait.** For each task, produce an implementation plan (files to touch, migrations, commands, risks) and wait for human approval before editing. Then keep a task list and work one task at a time.
3. **One branch per phase** (`phase-0-security`, `phase-6a-mobile`, …). Small commits, imperative messages. Never commit to `main` directly.
4. **HUMAN-ONLY actions — stop and ask, never do these yourself:**
   - `git push` (any kind), force-push, and any history rewrite (`git filter-repo`, `rebase` on shared branches, `reset --hard` on shared branches)
   - creating/rotating/revoking API keys, or editing any dashboard (Supabase, Vercel, OpenRouter, Mistral, E2B, Expo/EAS, Apple, Google)
   - running SQL against a real Supabase project
   - paid EAS builds, store submissions
   - deleting files outside the current task's scope
5. **Secrets.**
   - Never open, print, log, quote or paste values from `.env*` files or anything that looks like a key or token.
   - To inspect an env file, list variable **names only**: `sed -E 's/=.*//' .env.local`
   - Never put a secret in a plan, artifact, commit message, walkthrough or chat reply. If a command's output contains one, redact it in your report.
   - Never use the `NEXT_PUBLIC_` or `EXPO_PUBLIC_` prefix for a secret — those values ship to every client.
   - The service-role key and any provider key are **server-only**.
6. **Migrations are append-only.** Never edit an already-applied migration; add a new numbered file. Match existing naming (`00N_description.sql`).
7. **Every API boundary is validated with Zod.** Every table has RLS enabled with explicit policies. Every route that takes a resource ID verifies the caller owns it (or the resource is public).
8. **Report honestly** after each task: files changed, commands run **with real output**, what you could NOT verify, and follow-ups. If a check fails, say so. Do not claim success you did not observe.
9. **When uncertain, ask** one concrete question rather than guessing. Surface trade-offs; don't silently pick.

## Definition of done (every task)

Use the scripts that exist in `package.json`; otherwise the fallbacks.

- Web: `npx tsc --noEmit` · lint · `npm run build` all pass
- Mobile (`mobile/`): `npx tsc --noEmit` · `npx expo-doctor` · `npx expo export --platform ios` (bundling check; no device needed)
- New behavior has at least a minimal test or a documented manual verification step
- No new `any` casts on `framework`; use the union type `'vite' | 'next' | 'expo'`

## Conventions

- TypeScript strict. Shared API contracts live in `packages/api-types` as Zod schemas with inferred types.
- Errors from API routes use one shape: `{ "error": { "code": string, "message": string } }`.
- In React Native: no `localStorage`; use AsyncStorage / SecureStore. Install Expo-related packages with `npx expo install <pkg>` (never plain `npm install`) so versions match the SDK.
- Loading states use skeletons sized to the final layout; respect reduced-motion settings.

## Task order

1. `docs/agent-tasks/phase-0-security.md` — **do first**
2. Phases 1, 2, 5 from the design doc (bug fixes, API foundations, resilience) — Phase 6A lists the minimal prerequisites it needs if these aren't done yet
3. `docs/agent-tasks/phase-6-mobile.md` — 6A (mobile client) first; 6B (Expo app generation) only after explicit human approval
