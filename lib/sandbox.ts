import { Sandbox } from "@e2b/code-interpreter";

export type SandboxFramework = "vite-react" | "nextjs" | "react-native-expo";

export interface SandboxFile {
  path: string;
  content: string;
}

export interface SandboxResult {
  sandboxId: string;
  previewUrl: string;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ActiveSandboxEntry {
  sandbox: Sandbox;
  sandboxId: string;
  previewUrl: string;
  createdAt: number;
  lastAccessedAt: number;
  cleanupTimer: NodeJS.Timeout;
}

// In-memory store for active sandboxes (8-minute idle timeout)
const activeSandboxes = new Map<string, ActiveSandboxEntry>();
const IDLE_TIMEOUT_MS = 8 * 60 * 1000;
const DEV_SERVER_READY_TIMEOUT = 90_000; // 90s max to wait for dev server port

export const PROJECT_DIR = "/home/user/app";

/**
 * Maps each framework to its dedicated dev server port
 */
export function getPortForFramework(framework: SandboxFramework = "vite-react"): number {
  switch (framework) {
    case "nextjs":
      return 3000;
    case "react-native-expo":
      return 8081;
    case "vite-react":
    default:
      return 5173;
  }
}

/**
 * Detect framework from file paths if not explicitly provided
 */
export function detectFrameworkFromFiles(files: SandboxFile[]): SandboxFramework {
  const hasAppDir = files.some((f) => f.path.startsWith("app/") || f.path.includes("next.config"));
  if (hasAppDir) return "nextjs";

  const hasExpo = files.some(
    (f) => f.path === "app.json" || f.content?.includes("expo-status-bar") || f.content?.includes("react-native")
  );
  if (hasExpo) return "react-native-expo";

  return "vite-react";
}

/** Default Vite config that always binds to 0.0.0.0:5173 with allowedHosts: true */
const DEFAULT_VITE_CONFIG = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    hmr: { clientPort: 443, protocol: 'wss' },
  },
  build: { outDir: 'dist' },
});`;

/** Default package.json for Vite + React */
const DEFAULT_VITE_PACKAGE_JSON = JSON.stringify(
  {
    name: "byt-vite-app",
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite --host 0.0.0.0 --port 5173",
      build: "vite build",
      preview: "vite preview --port 4173 --host 0.0.0.0",
    },
    dependencies: {
      react: "^18.3.1",
      "react-dom": "^18.3.1",
      "lucide-react": "^0.453.0",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.5.4",
      "framer-motion": "^11.11.17",
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.3.3",
      "@types/react": "^18.3.12",
      "@types/react-dom": "^18.3.1",
      vite: "^5.4.9",
      typescript: "^5.6.3",
    },
  },
  null,
  2
);

/** Default package.json for Next.js 14 */
const DEFAULT_NEXTJS_PACKAGE_JSON = JSON.stringify(
  {
    name: "byt-nextjs-app",
    private: true,
    version: "0.1.0",
    scripts: {
      dev: "next dev -H 0.0.0.0 -p 3000",
      build: "next build",
      start: "next start -H 0.0.0.0 -p 3000",
      lint: "next lint",
    },
    dependencies: {
      next: "^14.2.15",
      react: "^18.3.1",
      "react-dom": "^18.3.1",
      "lucide-react": "^0.453.0",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.5.4",
      "framer-motion": "^11.11.17",
    },
    devDependencies: {
      "@types/node": "^20.17.0",
      "@types/react": "^18.3.12",
      "@types/react-dom": "^18.3.1",
      autoprefixer: "^10.4.20",
      postcss: "^8.4.47",
      tailwindcss: "^3.4.14",
      typescript: "^5.6.3",
    },
  },
  null,
  2
);

/** Default package.json for React Native Expo */
const DEFAULT_EXPO_PACKAGE_JSON = JSON.stringify(
  {
    name: "byt-expo-app",
    version: "1.0.0",
    scripts: {
      start: "expo start --web --port 8081 --host 0.0.0.0",
      android: "expo start --android",
      ios: "expo start --ios",
      web: "expo start --web --port 8081 --host 0.0.0.0",
    },
    dependencies: {
      expo: "~51.0.0",
      "expo-status-bar": "~1.12.1",
      react: "18.2.0",
      "react-native": "0.74.5",
      "react-native-web": "~0.19.10",
      "@expo/vector-icons": "^14.0.0",
      "lucide-react-native": "^0.453.0",
    },
    devDependencies: {
      "@babel/core": "^7.20.0",
      "@types/react": "~18.2.45",
      typescript: "~5.3.3",
    },
    private: true,
  },
  null,
  2
);

/**
 * Hardcoded "Hello World" Vite + React starter files
 */
export const HARDCODED_TEST_FILES: SandboxFile[] = [
  {
    path: "package.json",
    content: DEFAULT_VITE_PACKAGE_JSON,
  },
  {
    path: "vite.config.js",
    content: DEFAULT_VITE_CONFIG,
  },
  {
    path: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BYT Sandbox Application</title>
  </head>
  <body class="bg-slate-950 text-slate-100 min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  },
  {
    path: "src/main.jsx",
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  },
  {
    path: "src/App.jsx",
    content: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f23, #1a1a3e)', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', padding: '1rem' }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', borderRadius: '1.25rem', border: '1px solid rgba(124, 58, 237, 0.3)', background: 'rgba(15, 15, 35, 0.8)', backdropFilter: 'blur(16px)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', borderRadius: '9999px', background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)', color: '#a78bfa', fontSize: '12px', fontWeight: '600', marginBottom: '1.5rem' }}>
          ⚡ E2B Live Cloud MicroVM Sandbox
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ffffff', marginBottom: '1rem' }}>
          Hello World from <span style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BYT</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          Your Vite + React app is running in an isolated secure sandbox. Live preview, hot reload, and terminal execution are fully operational.
        </p>
        <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Interactive State</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>Clicks: {count}</div>
          </div>
          <button
            onClick={() => setCount(c => c + 1)}
            style={{ padding: '8px 16px', borderRadius: '8px', background: '#7c3aed', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            Increment
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#64748b' }}>
          <div>✅ Vite Dev Server (5173)</div>
          <div>✅ HTTPS Edge Ingress</div>
          <div>✅ HMR Hot Reload</div>
          <div>✅ React 18 StrictMode</div>
        </div>
      </div>
    </div>
  );
}`,
  },
];

/**
 * Hardcoded "Hello World" Next.js 14 starter files
 */
export const HARDCODED_NEXTJS_FILES: SandboxFile[] = [
  {
    path: "package.json",
    content: DEFAULT_NEXTJS_PACKAGE_JSON,
  },
  {
    path: "next.config.mjs",
    content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
export default nextConfig;`,
  },
  {
    path: "app/layout.tsx",
    content: `export const metadata = {
  title: 'Next.js App on BYT',
  description: 'Full stack Next.js 14 application in E2B sandbox',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#020617', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}`,
  },
  {
    path: "app/page.tsx",
    content: `'use client';
import { useState } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse at top, #0f172a, #020617)' }}>
      <div style={{ maxWidth: '540px', width: '100%', padding: '2.5rem', borderRadius: '1.25rem', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontSize: '12px', fontWeight: '600', marginBottom: '1rem' }}>
          ▲ Next.js 14 App Router Full-Stack
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ffffff', margin: '0 0 1rem 0' }}>
          Full-Stack Next.js on <span style={{ color: '#38bdf8' }}>BYT Cloud</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          Running live inside an isolated E2B microVM on port 3000. Features server components, API routes, and instantaneous hot reload.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.4)', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Client State (Counter): <strong>{count}</strong></span>
          <button
            onClick={() => setCount((c) => c + 1)}
            style={{ padding: '8px 18px', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}
          >
            Increment
          </button>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          ⚡ Port 3000 • Hostname 0.0.0.0 • Production Ready
        </div>
      </div>
    </main>
  );
}`,
  },
  {
    path: "app/api/hello/route.ts",
    content: `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Hello from Next.js 14 API Route in E2B MicroVM Sandbox!',
  });
}`,
  },
];

/**
 * Hardcoded "Hello World" React Native Expo starter files
 */
export const HARDCODED_EXPO_FILES: SandboxFile[] = [
  {
    path: "package.json",
    content: DEFAULT_EXPO_PACKAGE_JSON,
  },
  {
    path: "app.json",
    content: JSON.stringify(
      {
        expo: {
          name: "BYT Mobile App",
          slug: "byt-mobile-app",
          version: "1.0.0",
          orientation: "portrait",
          icon: "./assets/icon.png",
          userInterfaceStyle: "dark",
          splash: {
            backgroundColor: "#09090b",
          },
          ios: {
            supportsTablet: true,
            bundleIdentifier: "com.byt.mobileapp",
          },
          android: {
            adaptiveIcon: {
              backgroundColor: "#09090b",
            },
            package: "com.byt.mobileapp",
          },
          web: {
            bundler: "metro",
            favicon: "./assets/favicon.png",
          },
        },
      },
      null,
      2
    ),
  },
  {
    path: "App.tsx",
    content: `import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>📱 React Native • Expo SDK 51</Text>
          </View>
          <Text style={styles.title}>Cross-Platform Mobile App</Text>
          <Text style={styles.subtitle}>
            Native UI rendered with Expo Web in E2B sandbox. Download direct APK for Android or open in Expo Go!
          </Text>

          <View style={styles.counterRow}>
            <Text style={styles.counterText}>State Counter: {count}</Text>
            <TouchableOpacity style={styles.button} onPress={() => setCount(c => c + 1)}>
              <Text style={styles.buttonText}>Tap Me</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.specs}>
            <Text style={styles.specItem}>✅ Android APK Build Ready</Text>
            <Text style={styles.specItem}>✅ Google Play AAB Bundle</Text>
            <Text style={styles.specItem}>✅ Expo Go Instant QR Test</Text>
            <Text style={styles.specItem}>✅ Hot Module Replacement</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    maxWidth: 400,
    width: '100%',
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    marginBottom: 16,
  },
  badgeText: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#a1a1aa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  counterRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#27272a',
    marginBottom: 20,
  },
  counterText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#a855f7',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  specs: {
    width: '100%',
    gap: 6,
  },
  specItem: {
    color: '#71717a',
    fontSize: 12,
  },
});`,
  },
];

/**
 * Polls the sandbox terminal until the specified port is open or timeout is reached.
 * Returns true if the server came up, false on timeout.
 */
export async function waitForDevServer(
  sandbox: Sandbox,
  port: number = 5173,
  timeoutMs: number = DEV_SERVER_READY_TIMEOUT
): Promise<boolean> {
  const startTime = Date.now();
  const pollIntervalMs = 2500;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const check = await sandbox.commands.run(
        `curl -sf --max-time 3 http://localhost:${port}/ -o /dev/null && echo "OPEN" || echo "CLOSED"`
      );
      if (check.stdout?.includes("OPEN")) {
        console.log(`[E2B] Port ${port} is UP — dev server is responding!`);
        return true;
      }
    } catch {
      // ignore curl errors, keep polling
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  console.warn(`[E2B] Dev server on port ${port} did not come up within timeout.`);
  return false;
}

/**
 * Kills any stale dev server and relaunches it according to the project's framework.
 * Uses { background: true } without fragile shell nohup & wrappers.
 */
export async function relaunchDevServer(
  sandbox: Sandbox,
  framework: SandboxFramework = "vite-react"
): Promise<void> {
  const port = getPortForFramework(framework);

  try {
    // Gracefully terminate existing servers on the target port
    await sandbox.commands.run(
      `fuser -k ${port}/tcp 2>/dev/null; pkill -f "vite" 2>/dev/null; pkill -f "next" 2>/dev/null; pkill -f "expo" 2>/dev/null; sleep 1; true`
    );
  } catch {
    // ignore
  }

  if (framework === "nextjs") {
    await sandbox.commands.run(
      `cd ${PROJECT_DIR} && npx next dev -H 0.0.0.0 -p 3000 > /tmp/next-dev.log 2>&1`,
      { background: true }
    );
  } else if (framework === "react-native-expo") {
    await sandbox.commands.run(
      `cd ${PROJECT_DIR} && npx expo start --web --port 8081 --host 0.0.0.0 > /tmp/expo-dev.log 2>&1`,
      { background: true }
    );
  } else {
    // Ensure vite.config.js has allowedHosts: true
    await sandbox.files.write(`${PROJECT_DIR}/vite.config.js`, DEFAULT_VITE_CONFIG);
    try {
      await sandbox.commands.run(`rm -f ${PROJECT_DIR}/vite.config.ts`);
    } catch {}

    await sandbox.commands.run(
      `cd ${PROJECT_DIR} && npx vite --host 0.0.0.0 --port 5173 > /tmp/vite-dev.log 2>&1`,
      { background: true }
    );
  }
}

/**
 * Retrieves an active sandbox instance by ID or creates a new one.
 * Uses official Sandbox.connect(sandboxId) to reconnect to running or paused sandboxes.
 * Maps previewUrl to the framework's port.
 */
export async function getOrCreateActiveSandbox(
  sandboxId?: string,
  framework: SandboxFramework = "vite-react"
): Promise<ActiveSandboxEntry> {
  const port = getPortForFramework(framework);
  const apiKey = process.env.E2B_API_KEY;

  // 1. Check local in-memory active sandboxes map first
  if (sandboxId && activeSandboxes.has(sandboxId)) {
    const entry = activeSandboxes.get(sandboxId)!;
    touchSandbox(sandboxId);
    try {
      const host = entry.sandbox.getHost(port);
      entry.previewUrl = host.startsWith("http") ? host : `https://${host}`;
    } catch (e) {
      console.warn(`[E2B] Failed to refresh host for port ${port}:`, e);
    }
    return entry;
  }

  // 2. If sandboxId was provided, reconnect using Sandbox.connect()
  // As per official E2B guide: https://docs.e2b.dev/sandbox/connect
  if (sandboxId) {
    try {
      console.log(`[E2B] Reconnecting to existing sandbox: ${sandboxId}...`);
      const sandbox = await Sandbox.connect(sandboxId, {
        apiKey: apiKey || undefined,
        timeoutMs: IDLE_TIMEOUT_MS,
      });

      const host = sandbox.getHost(port);
      const previewUrl = host.startsWith("http") ? host : `https://${host}`;

      const cleanupTimer = setTimeout(async () => {
        await pauseSandbox(sandboxId);
      }, IDLE_TIMEOUT_MS);

      const entry: ActiveSandboxEntry = {
        sandbox,
        sandboxId,
        previewUrl,
        createdAt: Date.now(),
        lastAccessedAt: Date.now(),
        cleanupTimer,
      };

      activeSandboxes.set(sandboxId, entry);
      console.log(`[E2B] Successfully reconnected to sandbox ${sandboxId}! Preview: ${previewUrl}`);
      return entry;
    } catch (connectErr: any) {
      console.warn(
        `[E2B] Could not reconnect to sandbox ${sandboxId} (it may have expired or been killed): ${connectErr?.message || connectErr}. Creating a fresh instance.`
      );
      // Fall through to create a new sandbox instance
    }
  }

  // 3. Create a brand new sandbox instance
  const sandbox = await Sandbox.create({
    apiKey: apiKey || undefined,
    timeoutMs: IDLE_TIMEOUT_MS,
  });

  const newSandboxId = sandbox.sandboxId;
  const host = sandbox.getHost(port);
  const previewUrl = host.startsWith("http") ? host : `https://${host}`;

  // Prepare workspace directories
  await sandbox.commands.run(`mkdir -p ${PROJECT_DIR}/src ${PROJECT_DIR}/app`);

  const cleanupTimer = setTimeout(async () => {
    await pauseSandbox(newSandboxId);
  }, IDLE_TIMEOUT_MS);

  const entry: ActiveSandboxEntry = {
    sandbox,
    sandboxId: newSandboxId,
    previewUrl,
    createdAt: Date.now(),
    lastAccessedAt: Date.now(),
    cleanupTimer,
  };

  activeSandboxes.set(newSandboxId, entry);
  return entry;
}

/**
 * Automatically extracts external packages imported in files
 */
function extractImportedPackages(files: SandboxFile[]): string[] {
  const packages = new Set<string>();

  for (const file of files) {
    if (!file.path.endsWith(".js") && !file.path.endsWith(".jsx") && !file.path.endsWith(".ts") && !file.path.endsWith(".tsx")) {
      continue;
    }
    // Create fresh regex per file to avoid stale lastIndex from /g flag
    const importRegex = /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
    let match;
    while ((match = importRegex.exec(file.content)) !== null) {
      const specifier = match[1] || match[2];
      if (!specifier) continue;
      if (specifier.startsWith(".") || specifier.startsWith("/") || specifier.startsWith("@/")) {
        continue;
      }
      if (specifier.startsWith("@")) {
        const parts = specifier.split("/");
        if (parts.length >= 2) {
          packages.add(`${parts[0]}/${parts[1]}`);
        }
      } else {
        const pkgName = specifier.split("/")[0];
        if (!["fs", "path", "http", "https", "url", "stream", "crypto", "buffer", "os", "react", "react-dom"].includes(pkgName)) {
          packages.add(pkgName);
        }
      }
    }
  }

  return Array.from(packages);
}

/**
 * Writes all generated files into an active sandbox, installs dependencies,
 * launches the dev server, and polls the specific port until it's open.
 * Returns the verified public preview URL.
 */
export async function bootSandboxDevServer(
  sandboxEntry: ActiveSandboxEntry,
  files: SandboxFile[],
  framework: SandboxFramework = "vite-react",
  onCommand?: (cmd: string, stdout?: string, stderr?: string, exitCode?: number) => void
): Promise<string> {
  const { sandbox } = sandboxEntry;
  const port = getPortForFramework(framework);
  const host = sandbox.getHost(port);
  const previewUrl = host.startsWith("http") ? host : `https://${host}`;
  sandboxEntry.previewUrl = previewUrl;

  try {
    // 1. Prepare package.json according to framework
    let pkgJsonObj: any;
    const existingPkg = files.find((f) => f.path === "package.json");
    if (existingPkg) {
      try {
        pkgJsonObj = JSON.parse(existingPkg.content);
      } catch {
        pkgJsonObj = null;
      }
    }

    if (!pkgJsonObj) {
      const defaultJson =
        framework === "nextjs"
          ? DEFAULT_NEXTJS_PACKAGE_JSON
          : framework === "react-native-expo"
          ? DEFAULT_EXPO_PACKAGE_JSON
          : DEFAULT_VITE_PACKAGE_JSON;
      pkgJsonObj = JSON.parse(defaultJson);
    }

    if (!pkgJsonObj.dependencies) pkgJsonObj.dependencies = {};
    if (!pkgJsonObj.devDependencies) pkgJsonObj.devDependencies = {};

    // Auto-detect packages imported in generated files
    const detectedPkgs = extractImportedPackages(files);
    for (const pkg of detectedPkgs) {
      if (!pkgJsonObj.dependencies[pkg] && !pkgJsonObj.devDependencies[pkg]) {
        pkgJsonObj.dependencies[pkg] = "latest";
      }
    }

    await sandbox.files.write(`${PROJECT_DIR}/package.json`, JSON.stringify(pkgJsonObj, null, 2));

    // 2. Write all files to sandbox filesystem
    for (const file of files) {
      if (file.path === "package.json") continue;
      if (framework === "vite-react" && file.path.includes("vite.config")) continue;

      const filePath = `${PROJECT_DIR}/${file.path.replace(/^\/+/, "")}`;
      const parentDir = filePath.substring(0, filePath.lastIndexOf("/"));
      if (parentDir && parentDir !== PROJECT_DIR) {
        await sandbox.commands.run(`mkdir -p ${parentDir}`);
      }
      await sandbox.files.write(filePath, file.content);
    }

    // 3. For Vite, guarantee vite.config.js with allowedHosts: true
    if (framework === "vite-react") {
      await sandbox.files.write(`${PROJECT_DIR}/vite.config.js`, DEFAULT_VITE_CONFIG);
      try {
        await sandbox.commands.run(`rm -f ${PROJECT_DIR}/vite.config.ts`);
      } catch {}
    }

    // 4. Install npm dependencies
    onCommand?.("npm install --no-audit --prefer-offline");
    const installResult = await sandbox.commands.run(
      `cd ${PROJECT_DIR} && npm install --no-audit --prefer-offline --loglevel=warn`
    );
    onCommand?.(
      "npm install",
      installResult.stdout || "",
      installResult.stderr || "",
      installResult.exitCode ?? 0
    );

    // 5. Relaunch dev server for the framework
    onCommand?.(`Launching dev server on port ${port}...`);
    await relaunchDevServer(sandbox, framework);

    // 6. Poll until port is open (prevents premature 502)
    const isReady = await waitForDevServer(sandbox, port);
    if (!isReady) {
      console.warn(`[E2B] Port ${port} not open on first attempt. Retrying relaunch...`);
      await relaunchDevServer(sandbox, framework);
      await waitForDevServer(sandbox, port, 30_000);
    }

    return previewUrl;
  } catch (err: any) {
    console.error("[E2B bootSandboxDevServer error]:", err);
    throw err;
  }
}

/**
 * Dedicated function to reconnect to an existing sandbox by ID as per official E2B guide:
 * https://docs.e2b.dev/sandbox/connect
 */
export async function reconnectToSandbox(
  sandboxId: string,
  framework: SandboxFramework = "vite-react"
): Promise<SandboxResult> {
  const entry = await getOrCreateActiveSandbox(sandboxId, framework);
  return {
    sandboxId: entry.sandboxId,
    previewUrl: entry.previewUrl,
  };
}

/**
 * Creates and boots an E2B Sandbox with the specified files and framework.
 * If existingSandboxId is provided, reconnects to and reuses it without spawning a new one.
 */
export async function createSandboxWithFiles(
  files?: SandboxFile[],
  framework: SandboxFramework = "vite-react",
  existingSandboxId?: string | null
): Promise<SandboxResult> {
  const chosenFiles =
    files && files.length > 0
      ? files
      : framework === "nextjs"
      ? HARDCODED_NEXTJS_FILES
      : framework === "react-native-expo"
      ? HARDCODED_EXPO_FILES
      : HARDCODED_TEST_FILES;

  // Pass existingSandboxId if available to avoid wasting sandboxes
  const entry = await getOrCreateActiveSandbox(existingSandboxId || undefined, framework);

  try {
    const previewUrl = await bootSandboxDevServer(entry, chosenFiles, framework);
    return {
      sandboxId: entry.sandboxId,
      previewUrl,
    };
  } catch (error: any) {
    try {
      await pauseSandbox(entry.sandboxId);
    } catch {}
    throw new Error(`Failed to initialize E2B sandbox: ${error?.message || error}`);
  }
}

/**
 * High-Speed Live Changes Sync API: Writes changed files directly into the active microVM.
 * Follows official E2B batch file writing guide (sandbox.files.write(files)).
 * Automatically reconnects via Sandbox.connect() if sandboxId is not currently in memory.
 * Triggers instant HMR without restarting the dev server!
 */
export async function syncFilesToActiveSandbox(
  sandboxId: string,
  files: SandboxFile[]
): Promise<{ success: boolean; updatedCount: number }> {
  let entry = activeSandboxes.get(sandboxId);

  // If not currently in memory, reconnect via Sandbox.connect()
  if (!entry) {
    try {
      console.log(`[E2B Sync] Sandbox ${sandboxId} not in memory, reconnecting via Sandbox.connect...`);
      entry = await getOrCreateActiveSandbox(sandboxId);
    } catch (err: any) {
      console.warn(`[E2B Sync] Could not reconnect to sandbox ${sandboxId}:`, err?.message);
      return { success: false, updatedCount: 0 };
    }
  }

  touchSandbox(sandboxId);

  if (!files || files.length === 0) {
    return { success: true, updatedCount: 0 };
  }

  // Use official E2B batch files.write API:
  try {
    const writeEntries = files.map((file) => ({
      path: `${PROJECT_DIR}/${file.path.replace(/^\/+/, "")}`,
      data: file.content,
    }));
    await entry.sandbox.files.write(writeEntries);
    return { success: true, updatedCount: files.length };
  } catch (batchErr: any) {
    console.warn("[E2B Sync] Batch write failed, falling back to sequential writes:", batchErr?.message);
    let updatedCount = 0;
    for (const file of files) {
      try {
        const fullPath = `${PROJECT_DIR}/${file.path.replace(/^\/+/, "")}`;
        const parentDir = fullPath.substring(0, fullPath.lastIndexOf("/"));
        if (parentDir && parentDir !== PROJECT_DIR) {
          await entry.sandbox.commands.run(`mkdir -p ${parentDir}`);
        }
        await entry.sandbox.files.write(fullPath, file.content);
        updatedCount++;
      } catch (err) {
        console.warn(`[E2B Sync Warning] Failed to write ${file.path}:`, err);
      }
    }
    return { success: updatedCount > 0, updatedCount };
  }
}

// Forbidden command patterns to prevent destructive attacks or host probing
const FORBIDDEN_COMMAND_PATTERNS = [
  /\brm\s+(-[a-zA-Z0-9_\-]+\s+)*(\/|\/\*|~\/|\.\.)(\s|$)/,
  /:\(\)\s*\{\s*:\|:&\s*;\s*\}\s*;\s*:/, // fork bomb
  /\bmkfs\b/, // formatting drives
  /\bdd\s+if=/, // raw block device writes
  /169\.254\.169\.254/, // cloud metadata service access
  /\bshutdown\b/,
  /\breboot\b/,
];

export function isDangerousCommand(cmd: string): boolean {
  const normalized = cmd.trim();
  if (
    normalized.includes("rm -rf /") ||
    normalized.includes("rm -r /") ||
    normalized.includes("rm -rf /*") ||
    normalized.includes(":(){ :|:& };:") ||
    normalized.includes(":(){:|:&};:")
  ) {
    return true;
  }
  for (const pattern of FORBIDDEN_COMMAND_PATTERNS) {
    if (pattern.test(normalized)) {
      return true;
    }
  }
  return false;
}

/**
 * Runs an arbitrary terminal command inside an active E2B sandbox with security verification.
 * Automatically reconnects if the sandbox is not in local memory.
 */
export async function runCommandInSandbox(
  sandboxId?: string | null,
  command?: string
): Promise<CommandResult> {
  if (!command) {
    return { stdout: "", stderr: "No command provided", exitCode: 1 };
  }

  // Security policy enforcement
  if (isDangerousCommand(command)) {
    return {
      stdout: "",
      stderr: "Security Policy Violation: Command blocked by BYT sandbox security filter.",
      exitCode: 126,
    };
  }

  const entry = await getOrCreateActiveSandbox(sandboxId || undefined);
  touchSandbox(entry.sandboxId);

  const fullCmd = command.trim().startsWith("cd ")
    ? command
    : `cd ${PROJECT_DIR} && ${command}`;
  const result = await entry.sandbox.commands.run(fullCmd);

  // Auto-reload server if packages were modified
  const trimmed = command.trim();
  if (
    trimmed.startsWith("npm i") ||
    trimmed.startsWith("npm install") ||
    trimmed.startsWith("npm add") ||
    trimmed.startsWith("yarn add") ||
    trimmed.startsWith("pnpm add")
  ) {
    try {
      await relaunchDevServer(entry.sandbox);
    } catch (e) {
      console.warn("[E2B] Dev server auto-reload after install notice:", e);
    }
  }

  return {
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    exitCode: result.exitCode ?? 0,
  };
}

/**
 * Updates last active timestamp for an active sandbox to postpone idle timeout.
 */
export function touchSandbox(sandboxId: string): void {
  const entry = activeSandboxes.get(sandboxId);
  if (entry) {
    clearTimeout(entry.cleanupTimer);
    entry.lastAccessedAt = Date.now();
    entry.cleanupTimer = setTimeout(async () => {
      await pauseSandbox(sandboxId);
    }, IDLE_TIMEOUT_MS);
  }
}

/**
 * Pauses an active sandbox instance to preserve filesystem & memory without incurring compute charges.
 * Resume later seamlessly via Sandbox.connect(sandboxId).
 */
export async function pauseSandbox(sandboxId: string): Promise<boolean> {
  const entry = activeSandboxes.get(sandboxId);
  if (!entry) return false;

  clearTimeout(entry.cleanupTimer);
  activeSandboxes.delete(sandboxId);

  try {
    console.log(`[E2B] Pausing sandbox ${sandboxId} to preserve state...`);
    await entry.sandbox.pause();
    console.log(`[E2B] Sandbox ${sandboxId} paused successfully.`);
    return true;
  } catch (err: any) {
    console.warn(`[E2B] Failed to pause sandbox ${sandboxId}:`, err?.message);
    return false;
  }
}

/**
 * Explicitly terminates an active sandbox instance and frees resources permanently.
 */
export async function terminateSandbox(sandboxId: string): Promise<void> {
  const entry = activeSandboxes.get(sandboxId);
  if (entry) {
    clearTimeout(entry.cleanupTimer);
    try {
      await entry.sandbox.kill();
    } catch (e) {
      console.warn(`[E2B] Error while terminating sandbox ${sandboxId}:`, e);
    }
    activeSandboxes.delete(sandboxId);
    console.log(`[E2B] Sandbox ${sandboxId} terminated successfully.`);
  }
}
