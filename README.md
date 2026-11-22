# BYT Codebase Reverse Engineering & Security Audit Report

> **Generated using REA (Reverse Engineering Anything) Methodology & Static Analysis**  
> **Repository:** `BYT` (Autonomous AI Web & Mobile App Builder)  
> **Audited Date:** October 2026  
> **Scope:** Architecture, Security Boundaries, Authentication & Authorization, API Routes, Sandboxing, Logic Flows, and Tooling.

---

## Table of Contents

1. [Executive Summary & REA Analysis Methodology](#1-executive-summary--rea-analysis-methodology)
2. [Critical Security Vulnerabilities](#2-critical-security-vulnerabilities)
   - [2.1 Unauthenticated Header Spoofing & Auth Bypass (`x-firebase-uid`)](#21-unauthenticated-header-spoofing--auth-bypass-x-firebase-uid)
   - [2.2 Unverified JWT Payload Decoding & Missing Middleware (`proxy.ts`)](#22-unverified-jwt-payload-decoding--missing-middleware-proxyts)
   - [2.3 Critical Iframe Sandbox Escape & Same-Origin XSS (`app/preview/page.tsx`)](#23-critical-iframe-sandbox-escape--same-origin-xss-apppreviewpagetsx)
   - [2.4 Insecure Direct Object Reference (IDOR) & Project Overwrite (`/api/generate`)](#24-insecure-direct-object-reference-idor--project-overwrite-apigenerate)
   - [2.5 Unauthenticated Remote Sandbox Execution & Regex Blacklist Bypass (`/api/sandbox/command`)](#25-unauthenticated-remote-sandbox-execution--regex-blacklist-bypass-apisandboxcommand)
   - [2.6 Unauthenticated Denial of Service / Cloud Resource Drain (`/api/sandbox/create`)](#26-unauthenticated-denial-of-service--cloud-resource-drain-apisandboxcreate)
   - [2.7 Free Privilege Escalation to "Legendary" Plan (`/api/user` & `firestore.rules`)](#27-free-privilege-escalation-to-legendary-plan-apiuser--firestorerules)
   - [2.8 Open Redirect in OAuth Callback (`app/auth/callback/route.ts`)](#28-open-redirect-in-oauth-callback-appauthcallbackroutets)
3. [Broken Logic, Faulty Functions & Route Defects](#3-broken-logic-faulty-functions--route-defects)
   - [3.1 Broken Ternary Expression & Anonymous Quota Bypass in `/api/generate`](#31-broken-ternary-expression--anonymous-quota-bypass-in-apigenerate)
   - [3.2 Mock JSON Binary Disguised as Android APK (`/api/projects/download-apk`)](#32-mock-json-binary-disguised-as-android-apk-apiprojectsdownload-apk)
   - [3.3 Dead Auto-Debugger Pipeline (`attemptFix` never invoked)](#33-dead-auto-debugger-pipeline-attemptfix-never-invoked)
   - [3.4 Hallucinated & Invalid Model Slugs in Provider Cascade (`lib/ai/providers.ts`)](#34-hallucinated--invalid-model-slugs-in-provider-cascade-libaiprovidersts)
   - [3.5 Missing OAuth Code Exchange in `/auth/callback`](#35-missing-oauth-code-exchange-in-authcallback)
   - [3.6 Upstash Redis URI Length Overflow in `lib/cache.ts`](#36-upstash-redis-uri-length-overflow-in-libcachets)
   - [3.7 Fake Settings Save Handler (`app/(dashboard)/settings/page.tsx`)](#37-fake-settings-save-handler-appdashboardsettingspagetsx)
   - [3.8 Conflicting Double Redirect Chain (`/builder/[id]` -> `/project/[id]` -> `/apps/[id]/editor/preview`)](#38-conflicting-double-redirect-chain-builderid---projectid---appsideditorpreview)
4. [Architectural Split: Supabase vs. Firebase Schism](#4-architectural-split-supabase-vs-firebase-schism)
5. [Incomplete Code Files, Stubs & Simulated Mock Features](#5-incomplete-code-files-stubs--simulated-mock-features)
6. [Tooling, Scripts & Build Pipeline Failures](#6-tooling-scripts--build-pipeline-failures)
7. [Comprehensive Remediation Plan](#7-comprehensive-remediation-plan)

---

## 1. Executive Summary & REA Analysis Methodology

Using the **Reverse Engineering Anything (REA)** framework, we performed deep behavioral inspection, data-flow reconstruction, dependency boundary tracing, and runtime-semantics verification across the entire BYT repository. 

### Summary Findings
- **Security Posture:** **CRITICAL**. Multiple trivial authentication bypasses, unrestricted remote command execution, privilege escalations, and sandbox escapes exist.
- **Architectural Coherence:** **BROKEN**. The project suffers from an incomplete transition between Supabase (mandated by `AGENTS.md`) and Firebase/Firestore, leaving dead code, deleted middleware, and missing security barriers.
- **Functional Completeness:** **PARTIAL / MOCK**. Several high-profile advertised features (mobile APK compilation, Appetize live builds, auto-debugger agent loop, settings persistence, Stitch MCP wireframing) are simulated using `setTimeout` timers and dummy JSON strings.

---

## 2. Critical Security Vulnerabilities

### 2.1 Unauthenticated Header Spoofing & Auth Bypass (`x-firebase-uid`)
- **Files Affected:**
  - `app/api/projects/route.ts` (lines 10–12, 24)
  - `app/api/projects/[id]/route.ts` (lines 11–13)
  - `app/api/generate/route.ts` (line 68)
  - `app/api/user/route.ts` (lines 8–10)
  - `app/api/sandbox/command/route.ts` (line 25)
  - `app/(dashboard)/layout.tsx` (line 13)
- **Vulnerability Type:** CWE-290 (Authentication Bypass by Spoofing).
- **Mechanism:**  
  API route handlers attempt to read the user identity from an incoming HTTP header:
  ```ts
  function getUid(request: NextRequest): string | null {
    return request.headers.get("x-firebase-uid");
  }
  ```
  Any HTTP client or attacker can supply `x-firebase-uid: <target_victim_uid>` in their request headers. The server trusts this header unconditionally without verifying any cryptographic signature or session cookie.
- **Impact:** Complete account takeover, reading private projects, modifying or deleting other users' projects, and executing commands under other users' quotas.

### 2.2 Unverified JWT Payload Decoding & Missing Middleware (`proxy.ts`)
- **Files Affected:**
  - `proxy.ts` (lines 7–29, 31)
  - `middleware.ts` (deleted from repository)
- **Vulnerability Type:** CWE-347 (Improper Verification of Cryptographic Signature) & Next.js Runtime Architecture Failure.
- **Mechanism:**
  1. `middleware.ts` was deleted from git, meaning Next.js App Router does **not** execute any edge middleware on incoming requests.
  2. A replacement file named `proxy.ts` was created, but Next.js **only recognizes `middleware.ts` or `src/middleware.ts`**. `proxy.ts` is never executed by Next.js.
  3. Inside `proxy.ts`, JWT validation is implemented as raw string splitting and Base64 decoding (`token.split('.')[1]`, `atob(...)`, `JSON.parse(...)`) without checking the cryptographic signature against Firebase's public keys:
     ```ts
     const base64Url = parts[1];
     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
     const parsed = JSON.parse(decodeURIComponent(atob(base64)...));
     ```
- **Impact:** Anyone can forge an arbitrary JWT payload containing `{"uid": "admin", "exp": 9999999999}` without a valid signature and bypass authentication.

### 2.3 Critical Iframe Sandbox Escape & Same-Origin XSS (`app/preview/page.tsx`)
- **Files Affected:**
  - `app/preview/page.tsx` (line 439)
- **Vulnerability Type:** CWE-79 (Improper Neutralization of Input During Web Page Generation) / HTML5 Iframe Sandbox Misconfiguration.
- **Mechanism:**  
  The standalone in-browser preview embeds AI-generated/untrusted code inside an iframe using `srcDoc` with:
  ```html
  <iframe
    srcDoc={compiledSrcDoc}
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
  />
  ```
  Per W3C HTML and MDN security specifications, specifying both `allow-scripts` and `allow-same-origin` on an iframe sharing the same origin gives the contained script full access to the parent document. The script can access `window.parent.document`, read `localStorage`, read cookies, and dynamically remove its own sandbox attribute.
  Furthermore, AI-generated code is interpolated directly into `srcDoc` with naive regex replacements, allowing any prompt containing `</script><script>...` to execute arbitrary scripts.
- **Impact:** Full cross-site scripting (XSS), credential harvesting, and session hijacking in the user's browser.

### 2.4 Insecure Direct Object Reference (IDOR) & Project Overwrite (`/api/generate`)
- **Files Affected:**
  - `app/api/generate/route.ts` (lines 292–310)
- **Vulnerability Type:** CWE-639 (Authorization Bypass Through User-Controlled Key).
- **Mechanism:**  
  When `/api/generate` finishes synthesizing a project, it writes to Firestore using:
  ```ts
  let projectId = requestedProjectId || randomBytes(12).toString("hex");
  if (uid) {
    const newRef = db.collection("projects").doc(projectId);
    await newRef.set({
      userId: uid,
      name: plan.projectName,
      ...
    });
  }
  ```
  The endpoint accepts `projectId` from the caller and invokes `.set()` without checking whether a project with `projectId` already exists or belongs to another user.
- **Impact:** Any user can overwrite and hijack ownership of any other user's existing project by supplying their `projectId` in the JSON payload.

### 2.5 Unauthenticated Remote Sandbox Execution & Regex Blacklist Bypass (`/api/sandbox/command`)
- **Files Affected:**
  - `app/api/sandbox/command/route.ts` (lines 8–20, 24–30, 59)
- **Vulnerability Type:** CWE-78 (OS Command Injection) & Flawed Authorization.
- **Mechanism:**
  1. The route notes: `"Authenticate optionally; guests can use isolated sandbox terminal freely"`. Any unauthenticated caller can execute shell commands in microVMs.
  2. There is no ownership verification on `sandboxId`; an attacker can target any active sandbox.
  3. Command filtering uses a fragile blacklist regex (`/rm\s+-rf\s+\//`, `/curl\s+.*\|\s*bash/`). Standard shell obfuscations (`bash -c "c"$"url ... | sh"`, python execution, base64 decoding, hex escaping) easily bypass these regular expressions.
- **Impact:** Uncontrolled cloud container command execution, potential network pivoting, and resource abuse.

### 2.6 Unauthenticated Denial of Service / Cloud Resource Drain (`/api/sandbox/create`)
- **Files Affected:**
  - `app/api/sandbox/create/route.ts` (lines 6–42)
  - `lib/sandbox.ts` (lines 657–685)
- **Vulnerability Type:** CWE-400 (Uncontrolled Resource Consumption).
- **Mechanism:**  
  `/api/sandbox/create` requires no authentication and enforces no rate limits. A simple automated script can loop requests to `/api/sandbox/create`, spinning up hundreds of E2B microVMs until the organization's E2B account balance and concurrency limits are exhausted.
- **Impact:** Denial of service and severe billing drain.

### 2.7 Free Privilege Escalation to "Legendary" Plan (`/api/user` & `firestore.rules`)
- **Files Affected:**
  - `app/api/user/route.ts` (lines 66–69)
  - `firestore.rules` (lines 6–9)
- **Vulnerability Type:** CWE-269 (Improper Privilege Management).
- **Mechanism:**
  1. `PATCH /api/user` allows callers to directly supply `plan`:
     ```ts
     if (body.plan !== undefined && ["free", "medium", "premium", "legendary"].includes(body.plan)) {
       update.plan = body.plan;
     }
     ```
     No payment verification, Stripe webhook receipt, or admin role is checked.
  2. In `firestore.rules`, users have full write access to their document:
     ```
     match /users/{userId} {
       allow write: if request.auth != null && request.auth.uid == userId;
     }
     ```
     Any authenticated client using the client-side Firebase SDK can directly write `{ plan: "legendary" }` to their user document.
- **Impact:** Any user can upgrade themselves to the highest tier for free, granting 99,999 generation credits.

### 2.8 Open Redirect in OAuth Callback (`app/auth/callback/route.ts`)
- **Files Affected:**
  - `app/auth/callback/route.ts` (lines 3–7)
- **Vulnerability Type:** CWE-601 (URL Redirection to Untrusted Site).
- **Mechanism:**
  ```ts
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/dashboard";
  return NextResponse.redirect(`${origin}${next}`);
  ```
  If `next` is passed as `//attacker.com`, the resulting redirect URL `${origin}//attacker.com` evaluates as a protocol-relative URL on various browser parsers, redirecting the user to an external domain.
- **Impact:** Phishing and OAuth credential leakage.

---

## 3. Broken Logic, Faulty Functions & Route Defects

### 3.1 Broken Ternary Expression & Anonymous Quota Bypass in `/api/generate`
- **Location:** `app/api/generate/route.ts` (lines 65–98)
- **Broken Code:**
  ```ts
  // Line 65-66:
  const sessionCookie = request.cookies.get("session")?.value ||
    request.headers.get("x-firebase-uid") ? undefined : undefined;
  ```
  This expression **always** evaluates to `undefined`.
- **Faulty Flow:**
  - `lines 73–98`: The quota check is wrapped in `if (uid) { ... }`.
  - If a user is not authenticated (or simply removes their cookies/headers), `uid` is `null`. The monthly quota check is completely skipped!
  - **Result:** Authenticated free users are limited to 50 generations, while anonymous visitors have **unlimited free generations**.

### 3.2 Mock JSON Binary Disguised as Android APK (`/api/projects/download-apk`)
- **Location:** `app/api/projects/download-apk/route.ts` (lines 11–38) & `components/builder/MobileAppBuildModal.tsx` (lines 90–100)
- **Defect:**  
  The endpoint returns a raw JSON payload with Content-Type `application/vnd.android.package-archive`:
  ```json
  {
    "platform": "android",
    "package": "com.byt.safe-name",
    "version": "1.0.0",
    "framework": "react-native-expo"
  }
  ```
  This is **not** a compiled Dalvik/ART executable or valid APK zip. Any Android device or emulator attempting to install this file fails immediately with `INSTALL_PARSE_FAILED_NOT_APK`.
  Similarly, `MobileAppBuildModal.tsx` creates a client-side Blob of text and names it `.apk` / `.aab`.

### 3.3 Dead Auto-Debugger Pipeline (`attemptFix` never invoked)
- **Location:** `app/api/generate/route.ts` (line 7)
- **Defect:**  
  `attemptFix` is imported from `@/lib/ai/debugger` on line 7, but is never called anywhere in `route.ts`. When `bootSandboxDevServer` encounters a compilation or boot error, it simply logs a console warning and falls back to an in-browser preview without ever invoking the debugger agent loop.
  Furthermore, `lib/ai/debugger.ts` (line 14) is hardcoded exclusively for Vite + React; it has no awareness of Next.js or React Native Expo stack errors.

### 3.4 Hallucinated & Invalid Model Slugs in Provider Cascade (`lib/ai/providers.ts`)
- **Location:** `lib/ai/providers.ts` (lines 39–45, 147)
- **Defect:**
  1. `BEST_FREE_CODING_MODELS` lists model identifiers that do not exist on OpenRouter:
     - `nvidia/nemotron-3-super-120b-a12b:free`
     - `cohere/north-mini-code:free`
     - `google/gemma-4-31b-it:free` (Gemma 4 does not exist)
     - `minimax/minimax-m2.7:free`
     - `z-ai/glm-5.2:free`
  2. `callMistral` defaults to `codestral-2508` (line 147). Mistral API model IDs use YYMM naming (e.g. `codestral-latest`, `codestral-2405`, `codestral-2501`). `codestral-2508` returns a 404 from the Mistral API.

### 3.5 Missing OAuth Code Exchange in `/auth/callback`
- **Location:** `app/auth/callback/route.ts` (lines 3–7)
- **Defect:**  
  The OAuth callback route reads `next` and performs a redirect, but **never exchanges `searchParams.get("code")` for a session**. Any OAuth provider returning to this callback leaves the user unauthenticated.

### 3.6 Upstash Redis URI Length Overflow in `lib/cache.ts`
- **Location:** `lib/cache.ts` (line 38)
- **Defect:**  
  Redis commands are executed via GET requests to the REST URL:
  ```ts
  const url = `${REDIS_URL}/${[command, ...args.map(encodeURIComponent)].join("/")}`;
  ```
  When storing a project (`cacheSet`), the serialized JSON is passed as a URL path segment. Projects with file trees exceed standard HTTP URL length limits (4KB–8KB), causing Upstash to return `414 Request-URI Too Large` and breaking project caching. Upstash REST API requires `POST` with a JSON command array for commands with large values.

### 3.7 Fake Settings Save Handler (`app/(dashboard)/settings/page.tsx`)
- **Location:** `app/(dashboard)/settings/page.tsx` (lines 55–58)
- **Defect:**  
  Clicking "Save Settings" executes:
  ```ts
  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };
  ```
  None of the user's selected preferences (model selection, temperature, auto-install, system prompt, project name) are sent to any API or saved to `localStorage`.

### 3.8 Conflicting Double Redirect Chain (`/builder/[id]` -> `/project/[id]` -> `/apps/[id]/editor/preview`)
- **Location:**
  - `app/builder/[id]/page.tsx` redirects to `/project/${id}`
  - `app/(dashboard)/project/[id]/page.tsx` mounts a client component with a spinner, which then redirects to `/apps/${id}/editor/preview`
- **Defect:**  
  There are three separate route groups for the builder, resulting in unnecessary client hops and flash of blank screen / spinners.

---

## 4. Architectural Split: Supabase vs. Firebase Schism

The codebase is currently in an inconsistent state between two opposing backend paradigms:

| Component | Intended Stack (`AGENTS.md`) | Current Implementation State |
|---|---|---|
| **Primary Database** | Supabase Postgres with RLS | Firestore Admin SDK / Client SDK |
| **Authentication** | Supabase Auth (`@supabase/ssr`) | Firebase Auth (`firebase/auth`) |
| **Session Management** | Cookie-based session via Supabase middleware | Custom `session` cookie & spoofable `x-firebase-uid` |
| **Server Client** | `lib/supabase/server.ts` | `lib/firebase/admin.ts` |
| **Admin Client** | `lib/supabase/admin.ts` (claimed in audit, **missing**) | Firebase Admin (`firebase-admin/firestore`) |
| **Env Validation** | Zod schemas in `lib/env.server.ts` (**missing**) | Direct `process.env` access across files |

### Missing Files Claimed in `docs/security/phase-0-audit.md`:
1. `lib/supabase/admin.ts` — **Does not exist**.
2. `lib/env.ts` — **Does not exist**.
3. `lib/env.server.ts` — **Does not exist**.
4. `packages/api-types` — **Does not exist**.

### Conflicting Firebase Client Singletons:
- `lib/firebase.ts` sets fallback strings (`authDomain: "...firebaseapp.com"`).
- `lib/firebase/client.ts` uses non-null assertions (`process.env.NEXT_PUBLIC_FIREBASE_API_KEY!`). If any env var is omitted, the frontend crashes on boot.

---

## 5. Incomplete Code Files, Stubs & Simulated Mock Features

1. **`lib/mcp/stitch.ts`:**
   - Functions `validateStitchApiKey` and `generateStitchBlueprint` do not connect to any Stitch MCP server or external API. They use basic string matching (`prompt.includes("dashboard")`) and return hardcoded mock tokens.
2. **`components/builder/AppetizeEmulator.tsx`:**
   - The build process uses `setTimeout` delays to simulate Metro bundle compilation and bytecode packaging before loading the static Appetize "demo" app.
3. **`components/builder/MobileAppBuildModal.tsx`:**
   - APK and AAB build pipelines are mocked using `setTimeout` chains (1000ms, 2200ms, 3400ms) and download raw JSON strings.
4. **`app/(dashboard)/deployments/page.tsx`:**
   - Static hardcoded array of mock deployments (`DEPLOYMENTS`).
5. **`app/(dashboard)/history/page.tsx`:**
   - Static hardcoded array of mock checkpoint commits (`CHECKPOINTS`).
6. **`app/(dashboard)/templates/page.tsx`:**
   - Static hardcoded array of templates (`TEMPLATES`).
7. **`app/(dashboard)/projects/page.tsx`:**
   - Never calls `GET /api/projects`. Only reads and writes `localStorage`.
8. **`lib/project-storage.ts`:**
   - Contains hardcoded mock author information and seed projects inside `DEFAULT_PROJECTS`.

---

## 6. Tooling, Scripts & Build Pipeline Failures

1. **`npm test` failure:**
   - `package.json` defines `"test": "tsx tests/sandbox-tests.ts"`, but `tsx` is **not installed** in `devDependencies` or `dependencies`. Running `npm test` throws:
     `'tsx' is not recognized as an internal or external command`.
2. **`npm run lint` failure:**
   - `package.json` defines `"lint": "next lint"`. Next.js 16 / ESLint 9 configuration mismatch causes `next lint` to fail with:
     `Invalid project directory provided, no such directory: ...\lint`.
3. **Absence of Zod Validation:**
   - Rule 7 of `AGENTS.md` ("Every API boundary is validated with Zod") is violated across all API routes (`/api/projects`, `/api/generate`, `/api/sandbox/command`, `/api/sandbox/create`). Inputs are parsed using untyped `await request.json()`.

---

## 7. Comprehensive Remediation Plan

### Immediate Security Patches (Priority 1)
1. **Remove `x-firebase-uid` header trust:** Delete all reads of `request.headers.get("x-firebase-uid")`. Authenticate solely through cryptographically verified server-side cookies or Authorization Bearer tokens.
2. **Restore `middleware.ts`:** Remove `proxy.ts`. Re-implement valid Next.js `middleware.ts` that enforces route-guarding and redirects unauthenticated users to `/login`.
3. **Fix Iframe Sandbox in `/preview`:**
   - Remove `allow-same-origin` from the preview iframe, or serve the preview from a dedicated sandboxed sub-origin / domain.
   - Sanitize all injected code to prevent script breakout.
4. **Enforce Ownership Checks:**
   - On `/api/generate`, verify that `requestedProjectId` belongs to the requesting user before performing `.set()`.
   - On `/api/sandbox/command` and `/api/sandbox/pause`, verify that the caller owns the targeted sandbox.
   - Require authentication and per-IP rate limits on `/api/sandbox/create`.
5. **Lock Down Plan Upgrades:**
   - Remove `plan` from allowed fields in `PATCH /api/user`. Restrict plan modifications strictly to server-side payment webhooks (Stripe).
   - Update `firestore.rules` to disallow user writes to the `plan` field.

### Architectural Alignment (Priority 2)
1. **Choose Single Backend Identity:**
   - Decide definitively between Supabase (as specified in `AGENTS.md`) and Firebase.
   - Remove dead Supabase/Firebase duplicate client initializers.
2. **Implement Missing Core Utilities:**
   - Create `lib/env.server.ts` and `lib/env.ts` with Zod validation.
   - Create `packages/api-types` with shared request/response schemas.

### Functional Repairs (Priority 3)
1. **Fix Upstash REST Client:** Use HTTP `POST` with JSON bodies for Redis commands in `lib/cache.ts`.
2. **Correct AI Provider Model Slugs:** Replace invalid slugs with verified active models (e.g. `codestral-latest`, `mistral-small-latest`).
3. **Hook Up `attemptFix`:** Connect the auto-debugger in `/api/generate` during build failures.
4. **Fix Tooling:**
   - Add `tsx` to `devDependencies` so `npm test` runs cleanly.
   - Fix Next.js lint configuration.

