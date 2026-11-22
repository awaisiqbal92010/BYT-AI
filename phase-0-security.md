# Phase 0 — Security remediation

**Branch:** `phase-0-security` · **Owner:** agent (repo work) + human (dashboards, git history)
**Read `AGENTS.md` first.** Its HUMAN-ONLY and secrets rules apply to every step below.

## Why

Design-doc issue #4: `.env.local` contains real API keys and the Supabase service-role key, and it is (or was) committed. **Treat every key in it as compromised.** Rotation is the actual fix; purging git history is cleanup.

Also: the anon key is public by design, so **RLS is the real security boundary.** Missing policies (issues #9, #10) are security bugs.

## Who does what

| Agent | Human (agent must NOT do these) |
|---|---|
| Read-only audit, code and config changes, CI files | Rotate keys; edit Vercel / Supabase / provider dashboards; set spend limits |
| `git rm --cached`, `.gitignore`, `.env.example` | Backup clone, `git filter-repo`, force-push |
| Write SQL audit scripts | Run SQL in Supabase and paste results back |

## Sequence

1. Human starts **H1 (rotation)** immediately; agent starts **A1–A7** in parallel.
2. Merge the agent branch into `main`.
3. Human runs **H4 (history purge)** after rotation and after the merge. Do not create new branches from old history in between — after the purge everyone re-clones.
4. Human runs **H5–H6**, then the verification section.

---

## Agent tasks

### A1 — Read-only audit → `docs/security/phase-0-audit.md`

Run these and summarize. **The report must contain no secret values** — variable names and file paths only.

```bash
git ls-files | grep -E '(^|/)\.env'                                   # env files tracked now
git log --all --name-only --pretty=format: | grep -E '(^|/)\.env' | sort -u   # env files anywhere in history
sed -E 's/=.*//' .env.local | sort                                    # variable NAMES only
grep -rn "SERVICE_ROLE" --include='*.ts' --include='*.tsx' --include='*.js' . --exclude-dir=node_modules --exclude-dir=.next
grep -rnE "NEXT_PUBLIC_[A-Z_]*(SECRET|SERVICE|PRIVATE|TOKEN|KEY)" . --exclude-dir=node_modules --exclude-dir=.next
grep -rlE "(sk-or-|sk_live|eyJ[A-Za-z0-9_-]{20,}\.)" --include='*.ts' --include='*.tsx' --include='*.json' --include='*.md' . --exclude-dir=node_modules --exclude-dir=.next   # -l = file names only
```

The audit report must include:
- tracked env files, and env files present in history (with the commits' short hashes, no contents)
- every variable name classified: **server secret / public-by-design / plain config**
- every place the service-role key is used, and whether that file is server-only
- a table of API routes using the admin client: route · resolves the user? · checks ownership? · verdict
- any hardcoded-secret hits (file names only)
- how E2B sandboxes are created: which env vars are passed into them (see A7)

### A2 — Repo hygiene

- Add to `.gitignore`: `.env*` then `!.env.example`
- `git rm --cached .env.local` (and any other tracked env file found in A1). This only untracks; the local file stays.
- Create `.env.example` from the variable names found in A1: placeholder values, and a comment per variable marking it `server-only` or `public`.

### A3 — Env validation (`lib/env.ts`, `lib/env.server.ts`)

Validate env with Zod so the app fails fast on a missing or misplaced variable. Split server and client schemas.

```ts
// lib/env.ts  (client-safe)
import { z } from 'zod'
const client = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})
// Next.js only inlines NEXT_PUBLIC_* for LITERAL accesses like process.env.NEXT_PUBLIC_X.
// Do not spread or pass process.env here — build the object from literals.
export const clientEnv = client.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})
```

```ts
// lib/env.server.ts
import 'server-only'
import { z } from 'zod'
const server = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1),
  MISTRAL_API_KEY: z.string().min(1),
  E2B_API_KEY: z.string().min(1),
  // ...exact names come from A1
})
export const serverEnv = process.env.SKIP_ENV_VALIDATION ? (process.env as any) : server.parse(process.env)
```

Replace direct `process.env.X` reads in application code with `serverEnv` / `clientEnv`. Add `SKIP_ENV_VALIDATION` handling so CI builds without secrets still work. Also make the OpenRouter `HTTP-Referer` (issue #14) come from an env var here.

### A4 — Lock down the admin client

- Install `server-only`.
- Create `lib/supabase/admin.ts`:

```ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { serverEnv } from '@/lib/env.server'
import { clientEnv } from '@/lib/env'

export const admin = createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
```

- Move every service-role usage found in A1 to import from here. `npm run build` must fail if a client component imports it — confirm by reading the import graph.
- For each route in the A1 table with a missing ownership check: **propose the fix in the plan** (small, obvious fixes may be included; anything that changes behavior needs approval).

### A5 — RLS audit script (`supabase/verification/rls_audit.sql`)

Write this file **for the human to run**. Do not run it anywhere.

```sql
-- 1) RLS enabled?
select schemaname, tablename, rowsecurity from pg_tables where schemaname = 'public' order by tablename;

-- 2) Policies per table
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies where schemaname = 'public' order by tablename, cmd;

-- 3) RLS on but zero policies (deny-all; usually a bug for user-facing tables)
select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
  and not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname);

-- 4) SECURITY DEFINER functions in public (review for privilege escalation)
select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef;
```

Then, from the migration files, **draft (do not apply)** a new migration proposal for tables missing RLS or policies. The projects-table fixes (DELETE policy, `is_public` SELECT policy, missing columns, unique `slug` index) belong to Phase 1 migration `003`; just note them.

### A6 — Prevent recurrence

- `.gitleaks.toml`: extend the default rules; allowlist `.env.example`.
- Pre-commit hook running `gitleaks protect --staged` (husky or `pre-commit`, whichever the repo already uses; otherwise husky).
- CI workflow `.github/workflows/secret-scan.yml` running gitleaks on push and PR. Prefer running the gitleaks binary directly; the official GitHub Action may need a license for org-owned repos.
- Document in `docs/security/README.md`: where secrets live (Vercel env settings, separate Preview and Production values), `vercel env pull` for local dev, and the rotation checklist.

### A7 — E2B sandbox exposure review

Find where sandboxes are created (`lib/sandbox.ts` and callers). Report in the audit:
- which env vars / secrets are passed into the sandbox (there should be **none** of BYT's own keys — generated code is untrusted)
- sandbox timeout settings
- how preview URLs are exposed and who can reach them
Fix any leak of BYT secrets into the sandbox; propose the rest.

---

## Human tasks

### H0 — Backup
```bash
git clone --mirror <repo-url> byt-backup.git   # keep until you're sure everything works
```

### H1 — Rotate (do this first)
- **Supabase:** regenerate the service-role key. Check which key system the project uses: with legacy JWT-based keys, this means rotating the JWT secret, which also replaces the anon key and signs out all users (schedule it); the newer secret/publishable keys can be rolled independently.
- **OpenRouter, Mistral, E2B:** delete old keys, issue new ones.
- **Anything else that was in the file:** OAuth client secrets, Vercel tokens, webhook secrets.
- Put new values in **Vercel** (Production and Preview separately) and in your local `.env.local` (which is now untracked). **Never paste them into the IDE agent chat.**

### H2 — Look for abuse
Review OpenRouter and E2B usage logs, Supabase Auth users, and API/DB logs for activity you don't recognize.

### H3 — Set hard spend limits
OpenRouter credit limit, Mistral and E2B usage caps. Keep them until Phase 3 adds rate limiting.

### H4 — Purge history (after rotation and after the agent branch is merged)
```bash
git clone --mirror <repo-url> byt-clean.git && cd byt-clean.git
pip install git-filter-repo
git filter-repo --invert-paths --path .env.local          # add any other env paths found in audit A1
git remote add origin <repo-url>                          # filter-repo removes origin as a safeguard
git push --force --all origin && git push --force --tags origin
```
- Everyone deletes old clones and re-clones; open branches and PRs must be recreated.
- If on GitHub, ask GitHub Support to clear cached views and unreachable commits, and check forks.

### H5 — Run `supabase/verification/rls_audit.sql`
In the Supabase SQL editor. Paste the results (table and policy names only, no row data) back to the agent to finalize the RLS migration proposal.

### H6 — Turn on platform protections
GitHub secret scanning and push protection; Vercel env values scoped per environment.

---

## Verification (human runs, agent reports)

```bash
gitleaks detect --source . --log-opts="--all" --redact          # expect 0 findings
git log --all --full-history --oneline -- .env.local            # expect no output
grep -rn "SERVICE_ROLE" --include='*.ts*' . --exclude-dir=node_modules --exclude-dir=.next   # only lib/env.server.ts and lib/supabase/admin.ts
```

## Acceptance criteria

- [ ] All exposed keys rotated; old keys confirmed dead
- [ ] `.env.local` not tracked and not present anywhere in history
- [ ] `.env.example` committed; `.gitignore` covers `.env*`
- [ ] gitleaks passes locally (pre-commit) and in CI
- [ ] Service-role key referenced only in server-only modules; no `NEXT_PUBLIC_` secrets
- [ ] Env validated with Zod at boot; app fails fast on missing or misplaced variables
- [ ] RLS confirmed enabled on every table; missing-policy migration drafted for review
- [ ] Every ID-taking route verifies ownership or `is_public`
- [ ] No BYT secrets reachable from inside E2B sandboxes
- [ ] `docs/security/phase-0-audit.md` written, containing no secret values
