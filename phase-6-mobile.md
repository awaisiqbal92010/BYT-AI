# Phase 6 — Mobile

**Branch:** `phase-6a-mobile` · **Prerequisite:** Phase 0 complete
**Read `AGENTS.md` first.** Its HUMAN-ONLY and secrets rules apply to every step below.

## Scope

| Track | What | Status |
|---|---|---|
| **6A** | Native BYT client (Expo) for using BYT from a phone | Build first |
| **6B** | BYT *generates* Expo apps (new output type) | **Do not start without explicit human approval** — separate project, see the end of this file |

**6A in scope (v1):** login (email + OAuth), project list with create / rename / delete, builder chat with live build progress, preview in a WebView, settings, deep links.
**6A out of scope (v1):** code editing (file viewer is read-only, and optional), offline editing, push notifications, store submission.

## Facts verified on 2026-09-24 (re-verify before pinning)

- Current stable Expo SDK is **57** (React Native 0.86, React 19.2). SDK 58 is in **beta** (RN 0.88 RC, built for iOS 27) — **do not adopt until stable.** SDK 57 needs Node ≥ 22.13.
- `expo/fetch` supports streaming response bodies and `TextDecoderStream` on all platforms → use it for SSE.
- `expo-secure-store` (iOS Keychain) items are practically limited to ~2 KB, smaller than a Supabase session. Pattern: encryption key in SecureStore, encrypted session in AsyncStorage.
- Expo Go is positioned as a learning tool, the App Store version lags new SDKs, and dev mode now requires the same Expo account signed in on both CLI and app. **Use development builds for this project.**

Run `node -v`, `npx expo --version`, and check `docs.expo.dev` before scaffolding.

## Repo layout (target)

```
packages/api-types/          # Zod schemas + inferred types (shared web ↔ mobile)
mobile/
  app.config.ts              # scheme "byt"
  app/
    _layout.tsx              # providers, auth guard
    (auth)/login.tsx
    (tabs)/_layout.tsx  (tabs)/index.tsx  (tabs)/settings.tsx
    project/[id]/index.tsx   # builder (chat + progress)
    project/[id]/preview.tsx # WebView
  lib/  supabase.ts  api.ts  stream.ts  queryClient.ts
  components/  Skeleton.tsx  ...
```

---

## 6A tasks

Work in order. Each task: plan → approval → implement → verify → report.

### 6A.0 — Prerequisite check (report before doing anything else)

Inspect the repo and report, for each item, **exists / partial / missing**:
1. A `getUser(req)` helper accepting `Authorization: Bearer` as well as cookies
2. Builds that continue server-side after the client disconnects, with persisted, ordered events and an SSE endpoint supporting `Last-Event-ID`
3. Zod validation and a single error shape on the routes mobile will call
4. Sandbox resume endpoint (paused/expired sandboxes)

Implement only what is missing, as 6A.1 and 6A.2.

### 6A.1 — Backend: Bearer auth

```ts
// lib/auth/get-user.ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'   // existing cookie-based helper; adjust name
import { clientEnv } from '@/lib/env'

const anon = createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } })

export async function getUser(req: Request) {
  const bearer = req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1]
  if (bearer) {
    const { data, error } = await anon.auth.getUser(bearer)   // validates the JWT with Supabase Auth
    return error ? null : data.user
  }
  const { data } = await (await createServerClient()).auth.getUser()
  return data.user
}
```

Also add `getSupabaseForRequest(req)`: for Bearer requests, return a per-request Supabase client created with `global: { headers: { Authorization: 'Bearer <token>' } }` so **RLS applies to the user**. Do not use the admin client for user-scoped reads.

Apply to every route mobile calls (projects list/get/create/update/delete, builds, sandbox resume, profile). No CORS changes are needed for native clients.

**Acceptance:** with `curl`: valid token → 200; missing → 401; tampered → 401; user A cannot read user B's project → 404/403.

### 6A.2 — Backend: resumable builds (highest risk — needs approved plan)

Goal: a build survives client disconnects; a client can resume from the last event it saw.

Migration `00N_builds.sql` (match real `projects.id` type):

```sql
create table public.builds (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'running' check (status in ('running','completed','failed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.build_events (
  build_id uuid not null references public.builds(id) on delete cascade,
  seq bigint not null,
  type text not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  primary key (build_id, seq)
);
alter table public.builds enable row level security;
alter table public.build_events enable row level security;
create policy builds_select_own on public.builds for select using (auth.uid() = user_id);
create policy build_events_select_own on public.build_events for select
  using (exists (select 1 from public.builds b where b.id = build_id and b.user_id = auth.uid()));
-- writes happen server-side via the admin client only; no client write policies
```

Endpoints:
- `POST /api/builds` → creates the build, starts the pipeline, returns `{ buildId }`.
- `GET /api/builds/[id]` → `{ status, lastSeq }` (polling fallback).
- `GET /api/builds/[id]/events` → SSE. Reads `Last-Event-ID` (or `?after=`), replays events with `seq > last`, then tails until a terminal event or ~5 s before the function's `maxDuration`, then closes. Frames: `id: <seq>\ndata: <json>\n\n`; heartbeat comment every 15 s. Clients reconnect automatically.

Pipeline rules: persist each event **before** emitting it; `seq` is monotonic per build; the build must keep running after the HTTP connection closes.

**Ask, don't guess:** if a full build can exceed the platform's function time limit, or there is no supported way to keep work running after the response ends, state that in the plan and propose options (background job / queue / split into resumable steps). Do not silently pick one.

Event types (adapt to what the pipeline really emits today): `build.started`, `build.log`, `file.written`, `sandbox.ready`, `build.completed`, `build.failed`. Define them as a Zod discriminated union in `packages/api-types`.

**Acceptance:** start a build; kill the client mid-stream; reconnect with `Last-Event-ID`; receive exactly the missed events in order; build reaches `build.completed`.

### 6A.3 — Shared package `packages/api-types`

Zod schemas: `Project`, `BuildEvent`, `ApiError`, request bodies. Set up npm workspaces (`packages/*`, `mobile`) and `transpilePackages: ['@byt/api-types']` in `next.config`.
**Risk to flag in the plan:** converting to workspaces can affect the Vercel install/build. Propose the minimal change and tell the human to confirm a Vercel **preview deploy** still builds.

### 6A.4 — Scaffold `mobile/`

- Create with SDK 57 explicitly (e.g. `npx create-expo-app@latest mobile --template default@sdk-57`). If a prompt asks about Expo Go compatibility vs latest SDK, choose **SDK 57**. Confirm the `expo` version in `package.json` afterwards.
- Install with `npx expo install`: `@supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill expo-secure-store react-native-get-random-values expo-web-browser expo-linking react-native-webview @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-async-storage-persister zustand zod`, plus `aes-js` and `@types/aes-js`.
- `app.config.ts`: `scheme: 'byt'`; bundle identifiers as **placeholders** — ask the human for the real ones.
- Env (public-by-design values only): `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Provide `mobile/.env.example`. **Never** put the service-role key or any provider key in `EXPO_PUBLIC_*`.
- Target platforms: iOS and Android only (SecureStore has no web implementation).

**Acceptance:** `npx tsc --noEmit`, `npx expo-doctor`, `npx expo export --platform ios` pass.

### 6A.5 — Supabase client with encrypted session storage

```ts
// mobile/lib/supabase.ts
import 'react-native-url-polyfill/auto'
import 'react-native-get-random-values'
import { AppState } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as aesjs from 'aes-js'
import { createClient } from '@supabase/supabase-js'

class LargeSecureStore {
  private async encrypt(key: string, value: string) {
    const k = crypto.getRandomValues(new Uint8Array(32))
    const cipher = new aesjs.ModeOfOperation.ctr(k, new aesjs.Counter(1))
    const enc = cipher.encrypt(aesjs.utils.utf8.toBytes(value))
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(k))
    return aesjs.utils.hex.fromBytes(enc)
  }
  private async decrypt(key: string, value: string) {
    const kHex = await SecureStore.getItemAsync(key)
    if (!kHex) return null
    const cipher = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(kHex), new aesjs.Counter(1))
    return aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(value)))
  }
  async getItem(key: string) {
    try {
      const enc = await AsyncStorage.getItem(key)
      return enc ? await this.decrypt(key, enc) : null
    } catch { await this.removeItem(key); return null }   // self-heal on key/blob desync → signed out
  }
  async setItem(key: string, value: string) { await AsyncStorage.setItem(key, await this.encrypt(key, value)) }
  async removeItem(key: string) { await AsyncStorage.removeItem(key); await SecureStore.deleteItemAsync(key) }
}

export const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { storage: new LargeSecureStore(), autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
})

// Only refresh tokens while the app is in the foreground
AppState.addEventListener('change', (s) => (s === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()))
```

Keep the encryption dependencies current. SecureStore keys may only contain alphanumerics, `.`, `-`, `_` — verify Supabase's storage key complies.

**Acceptance:** sign in, kill the app, relaunch → still signed in; corrupt the AsyncStorage entry → app lands on login without crashing.

### 6A.6 — Auth screens, OAuth, route guard

- Email sign-in / sign-up screen.
- OAuth via PKCE:

```ts
const redirectTo = makeRedirectUri({ scheme: 'byt', path: 'auth/callback' })
const { data } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } })
const res = await WebBrowser.openAuthSessionAsync(data.url!, redirectTo)
if (res.type === 'success') {
  const code = new URL(res.url).searchParams.get('code')
  if (code) await supabase.auth.exchangeCodeForSession(code)
}
```

- Route guard in the root layout: unauthenticated users can reach only `(auth)`. Use `Stack.Protected` if available in the installed Expo Router; otherwise redirect in the layout.
- **Human action needed:** add `byt://auth/callback` to Supabase Auth → Redirect URLs. Tell the human exactly what to add.

### 6A.7 — API client and data layer

- `lib/api.ts`: typed fetch wrapper. Adds `Authorization: Bearer <access_token>`; parses responses with the shared Zod schemas; on 401 calls `supabase.auth.refreshSession()` once and retries, else signs out.
- TanStack Query with a persisted cache (AsyncStorage persister) so the project list renders offline. `gcTime` ≥ persister `maxAge`; add a `buster` tied to the app version. **Do not persist** auth data or build-stream state.
- Hooks: `useProjects`, `useProject`, create / rename / delete mutations with optimistic updates and rollback. Rename sends the current `updated_at`; on 409, refetch and show a conflict message.

### 6A.8 — Dashboard tab

Project list, pull-to-refresh, empty state, create button, long-press menu (rename, delete with confirmation). Skeleton rows sized like real rows; respect `AccessibilityInfo.isReduceMotionEnabled`.

### 6A.9 — Builder screen (streaming)

Prompt input + progress list driven by `BuildEvent`s. Streaming client with resume:

```ts
// mobile/lib/stream.ts
import { fetch } from 'expo/fetch'
import { BuildEventSchema, type BuildEvent } from '@byt/api-types'

const TERMINAL = new Set(['build.completed', 'build.failed'])

export async function streamBuild(
  buildId: string, getToken: () => Promise<string>,
  onEvent: (e: BuildEvent) => void, signal?: AbortSignal,
) {
  let lastId = ''
  let failures = 0
  while (!signal?.aborted && failures < 5) {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/builds/${buildId}/events`, {
        signal,
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          Accept: 'text/event-stream',
          ...(lastId ? { 'Last-Event-ID': lastId } : {}),
        },
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
      failures = 0
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
      let buf = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break                          // server closed (time limit) → loop reconnects with lastId
        buf += value
        const frames = buf.split('\n\n')
        buf = frames.pop() ?? ''
        for (const frame of frames) {
          const id = /^id: (.+)$/m.exec(frame)?.[1]
          const data = /^data: (.+)$/m.exec(frame)?.[1]
          if (id) lastId = id
          if (!data) continue
          const evt = BuildEventSchema.parse(JSON.parse(data))
          onEvent(evt)
          if (TERMINAL.has(evt.type)) return
        }
      }
    } catch {
      if (signal?.aborted) return
      failures++
      await new Promise((r) => setTimeout(r, 2 ** failures * 500))
    }
  }
  if (!signal?.aborted) throw new Error('Build stream lost')
}
```

Behavior requirements:
- iOS suspends networking shortly after backgrounding. On `AppState` → `active`, ensure the stream is running (or fetch `GET /api/builds/[id]` and resume).
- Abort the stream on unmount. Haptic on completion.
- Fall back to polling `GET /api/builds/[id]` if streaming fails 5 times.

**Acceptance (human, on device):** start a build; toggle airplane mode for 20 s; background the app for 60 s; the timeline continues without duplicates or gaps and reaches completion.

### 6A.10 — Preview screen

`react-native-webview` pointed at the sandbox URL.
- Before loading, call the sandbox resume endpoint; show a skeleton while it resumes. States: resuming · ready · expired (offer "Restart preview") · error.
- Sandbox content is **untrusted**: no JS bridge (no `onMessage` handling of privileged actions, no injected scripts), `originWhitelist` limited to the sandbox origin, `onShouldStartLoadWithRequest` blocks other origins (open them in the system browser), `setSupportMultipleWindows={false}`, file access disabled.

### 6A.11 — Settings

Profile, sign out, app version, links to privacy policy / terms (**ask the human for URLs**), and **delete account**: `DELETE /api/account` (requires a recent sign-in; deletes the user's projects and storage, then the auth user, via the admin client). Present the destructive design in the plan and get approval before implementing.

### 6A.12 — Deep links

`byt://project/<id>` opens that project's builder; unauthenticated users go to login and then continue to the link. (Universal links need a human-owned domain and are out of scope for now.)

### 6A.13 — Docs

`mobile/README.md`: setup, env vars, running a development build (`npx expo run:ios` / `run:android` or EAS dev build), typecheck, bundle check. Plus a manual test checklist:
- [ ] email sign-in / sign-up
- [ ] OAuth sign-in
- [ ] session survives kill and relaunch
- [ ] create / rename / delete project (rename conflict handled)
- [ ] build with airplane-mode toggle and 60 s background → resumes cleanly
- [ ] preview loads; expired sandbox recovers
- [ ] sign out; delete account

## Human-only tasks (6A)

- Add redirect URL(s) in Supabase Auth: `byt://auth/callback`.
- Create Expo/EAS project (`eas init`), Apple Developer and Google Play accounts, real bundle identifiers, privacy-policy URL.
- Confirm a Vercel preview deploy still builds after the workspace change (6A.3).
- Device testing per the checklist.
- Before store submission, check current App Review rules for: in-app account deletion, Sign in with Apple when offering other social logins, and how user-generated app previews are framed (keep them as web content in a WebView; do not run downloaded native code).

## Definition of done (6A)

- [ ] Backend accepts Bearer tokens; RLS applies to mobile users; cross-user access is denied
- [ ] Builds are resumable and verified by the kill-and-reconnect test
- [ ] Mobile app passes `tsc`, `expo-doctor`, and `expo export --platform ios`
- [ ] Manual checklist passed on at least one iOS and one Android device
- [ ] No secrets in `EXPO_PUBLIC_*`; gitleaks clean

---

## 6B — Generating Expo apps (LOCKED until the human approves)

Before writing code, produce a design plan answering: preview strategy, sandbox template, codegen changes, debugger changes, ship path, and a benchmark plan.

**Defaults to propose:**
- **Preview:** Expo Web in the existing live-preview iframe (`expo start --web`, react-native-web). Optional on-device preview via a development build; do not depend on Expo Go. EAS Build on demand is v2.
- **SDK:** pin generated projects to **SDK 57** until 58 is stable.
- **Sandbox template:** Node ≥ 22.13, pre-warmed Expo template with cached dependencies, Metro port exposed.
- **Codegen:** add `'expo'` to the framework union. The system prompt must state the SDK version and RN rules (no DOM elements; `View` / `Text` / `Pressable`; Expo Router conventions; safe areas; AsyncStorage / SecureStore instead of `localStorage`; a known-good package list).
- **Dependencies:** install with `npx expo install <pkg>`; reuse the fixed `extractImportedPackages`.
- **Auto-debugger:** feed it Metro bundler errors, `npx expo-doctor`, and `tsc --noEmit` output.
- **Ship:** `expo export -p web` → Vercel/Netlify for web; for native, zip download or GitHub push with EAS instructions. No automated store submission.

**Acceptance:** a benchmark of ~30 prompts; report the share that reach a working preview without manual fixes, plus median time-to-first-preview. The human sets the target before implementation starts.
