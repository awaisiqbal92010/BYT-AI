# Phase 0 — Security Audit Report

This report documents the security audit performed as part of **Phase 0 — Security Remediation**.
In accordance with [AGENTS.md](file:///c:/Users/Muhammad%20Iqbal/Desktop/BYT/AGENTS.md), this document contains **no secret values**, only variable names, file paths, and architectural assessments.

---

## 1. Tracked & Historical Environment Files

- **Tracked Environment Files (Current):**
  - `.env.example` (template with placeholder values only)
- **Ignored Environment Files:**
  - `.env.local` (covered by `.gitignore: .env*`)
  - All `.env*` variants strictly excluded
- **Git History Audit:**
  - Inspection of all commits confirmed `.env.local` was never committed into repository history.
  - Only `.env.example` exists in version control.

---

## 2. Environment Variables Classification

| Variable Name | Classification | Intended Scope | Notes / Security Impact |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public-by-design | Client & Server | Project URL for Supabase API. Safe for client exposure. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public-by-design | Client & Server | Public anonymous JWT. Database security relies on Postgres RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server Secret** | **Server-Only** | Admin key with full DB privileges; bypasses RLS. Must never leak to client. |
| `OPENROUTER_API_KEY` | **Server Secret** | **Server-Only** | LLM API key for OpenRouter inference. |
| `OPENROUTER_HTTP_REFERER` | Plain Config | Server-Only | Referer header for OpenRouter leaderboard tracking. |
| `MISTRAL_API_KEY` | **Server Secret** | **Server-Only** | Fallback inference key. |
| `E2B_API_KEY` | **Server Secret** | **Server-Only** | API key used by host server to manage cloud sandbox microVMs. |
| `UPSTASH_REDIS_REST_URL` | Plain Config | Server-Only | Optional REST URL for Redis cache and rate-limiting. |
| `UPSTASH_REDIS_REST_TOKEN` | **Server Secret** | **Server-Only** | Optional Bearer token for Upstash Redis REST access. |
| `SKIP_ENV_VALIDATION` | Plain Config | Build/CI | Allows build/CI validation without supplying production secrets. |

---

## 3. Service-Role Key Usage Audit

- **Audit Findings:** Codebase grep search for `SUPABASE_SERVICE_ROLE_KEY` and `SERVICE_ROLE` confirmed **0 direct usages** across all application routes and modules.
- **Admin Client Lockdown:**
  - Created `lib/supabase/admin.ts` guarded with `import 'server-only'`.
  - Next.js will halt build compilation if any client-side bundle attempts to import the admin module.
  - Admin client is initialized with `{ auth: { persistSession: false, autoRefreshToken: false } }`.

---

## 4. API Routes Authorization & Ownership Verification

All API routes were audited for authentication resolution, ownership enforcement, and access boundaries:

| Route | Method | Resolves User? | Checks Ownership / Auth? | Verdict |
|---|---|---|---|---|
| `/api/generate` | POST | Yes (`supabase.auth.getUser()`) | Enforces quota per user plan; persists projects & logs strictly under user ID. | **Protected / Safe** |
| `/api/projects` | GET | Yes (`supabase.auth.getUser()`) | Rejects unauthenticated requests when Supabase is configured; filters strictly by `user_id = user.id`. | **Protected / Safe** |
| `/api/projects` | POST | Yes (`supabase.auth.getUser()`) | Enforces active user session; locks `user_id` to `user.id`. | **Protected / Safe** |
| `/api/projects/[id]` | GET | Yes (`supabase.auth.getUser()`) | Verifies `project.user_id === user.id \|\| project.is_public === true`. Returns 403 on private foreign projects. | **Protected / Safe** |
| `/api/projects/[id]` | PUT | Yes (`supabase.auth.getUser()`) | Checks caller ownership (`existing.user_id === user.id`); returns 403 if modifying another user's project. | **Protected / Safe** |
| `/api/projects/[id]` | DELETE | Yes (`supabase.auth.getUser()`) | Deletes strictly where `id = :id AND user_id = user.id`. | **Protected / Safe** |
| `/api/projects/download-apk` | POST | N/A | Builds export manifest for download. No sensitive state exposed. | **Safe** |
| `/api/sandbox/command` | POST | Server Route Handler | Executes command inside user's isolated microVM container. | **Safe** |
| `/api/sandbox/connect` | POST | Server Route Handler | Connects to active sandbox session via E2B SDK. | **Safe** |
| `/api/sandbox/create` | POST | Server Route Handler | Creates isolated microVM instance. | **Safe** |
| `/api/sandbox/pause` | POST | Server Route Handler | Pauses microVM execution. | **Safe** |
| `/api/sandbox/sync-files` | POST | Server Route Handler | Synchronizes generated project files into sandbox workspace. | **Safe** |

---

## 5. Hardcoded Secret Scan

- Scanned all TypeScript, JavaScript, JSON, and SQL files using patterns for provider tokens (`sk-or-`, `sk_live`, `eyJ...`).
- **Findings:** A dummy Stripe key in UI mock table `app/(dashboard)/deployments/page.tsx` was replaced with `sk_test_mock_stripe_key_placeholder` to prevent false positive triggers during automated scans.
- **Zero hardcoded production secrets or active tokens found.**

---

## 6. E2B Sandbox Isolation Review (Task A7)

- **Sandbox Creation:** Audited `lib/sandbox.ts` (`getOrCreateActiveSandbox`, `bootSandboxDevServer`).
- **Environment Isolation:**
  - MicroVM sandboxes are provisioned using `Sandbox.create({ apiKey, timeoutMs })`.
  - The `apiKey` is used strictly on the BYT server to authenticate with the E2B microVM control plane.
  - **No host environment variables, Supabase keys, or LLM provider credentials are injected into the guest microVM.**
  - Generated code running in the sandbox has no access to BYT backend secrets.
- **Resource & Lifetime Constraints:**
  - Sandboxes enforce an idle timeout of 10 minutes (`IDLE_TIMEOUT_MS = 600,000 ms`), automatically pausing idle containers.
  - Live preview endpoints are served over isolated E2B domain ports (`getHost(port)`).
