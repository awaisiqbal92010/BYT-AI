import JSZip from "jszip";

export interface ExportableFile {
  path: string;
  content: string;
}

/**
 * Creates a downloadable .zip archive containing all workspace files
 * and triggers an automatic browser download.
 * Intelligently packages Vite, Next.js, or React Native Expo projects.
 */
export async function downloadProjectAsZip(
  files: ExportableFile[],
  projectName: string = "byt-generated-app",
  framework?: "Next.js 14" | "Vite + React" | "React Native Expo" | string
): Promise<void> {
  const zip = new JSZip();
  const safeName = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-") || "byt-app";

  const fileMap = new Map<string, string>();

  if (files && files.length > 0) {
    for (const f of files) {
      if (f.path && f.content !== undefined) {
        fileMap.set(f.path.replace(/^\/+/, ""), f.content);
      }
    }
  }

  const isNextJs =
    framework === "Next.js 14" ||
    fileMap.has("next.config.mjs") ||
    fileMap.has("next.config.js") ||
    Array.from(fileMap.keys()).some((k) => k.startsWith("app/"));

  const isExpo =
    framework === "React Native Expo" ||
    fileMap.has("app.json") ||
    fileMap.has("eas.json") ||
    (fileMap.has("App.tsx") && !fileMap.has("index.html"));

  if (isExpo) {
    // Expo / React Native project
    if (!fileMap.has("package.json")) {
      fileMap.set(
        "package.json",
        JSON.stringify(
          {
            name: safeName,
            version: "1.0.0",
            scripts: {
              start: "expo start",
              android: "expo start --android",
              ios: "expo start --ios",
              web: "expo start --web",
              "build:apk": "eas build -p android --profile preview",
              "build:aab": "eas build -p android --profile production",
            },
            dependencies: {
              expo: "~51.0.0",
              "expo-status-bar": "~1.12.1",
              react: "18.2.0",
              "react-native": "0.74.5",
              "react-native-web": "~0.19.10",
              "@expo/vector-icons": "^14.0.0",
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
        )
      );
    }

    if (!fileMap.has("app.json")) {
      fileMap.set(
        "app.json",
        JSON.stringify(
          {
            expo: {
              name: projectName,
              slug: safeName,
              version: "1.0.0",
              orientation: "portrait",
              userInterfaceStyle: "dark",
              ios: { supportsTablet: true, bundleIdentifier: `com.byt.${safeName}` },
              android: { package: `com.byt.${safeName}`, adaptiveIcon: { backgroundColor: "#09090b" } },
              web: { bundler: "metro" },
            },
          },
          null,
          2
        )
      );
    }

    if (!fileMap.has("eas.json")) {
      fileMap.set(
        "eas.json",
        JSON.stringify(
          {
            cli: { version: ">= 10.0.0" },
            build: {
              preview: {
                android: { buildType: "apk" },
                distribution: "internal",
              },
              production: {
                android: { buildType: "app-bundle" },
              },
            },
          },
          null,
          2
        )
      );
    }

    if (!fileMap.has("README.md") && !fileMap.has("readme.md")) {
      fileMap.set(
        "README.md",
        `# ${projectName} (React Native Expo)

Built with **BYT AI Builder**.

## 📱 Mobile Quick Start

1. **Install dependencies**:
\`\`\`bash
npm install
\`\`\`

2. **Start development server**:
\`\`\`bash
npx expo start
\`\`\`
Scan the QR code with the **Expo Go** app on Android or iOS.

3. **Build Standalone APK for Android**:
\`\`\`bash
npx eas-cli build -p android --profile preview
\`\`\`

4. **Build Google Play Store Release (AAB)**:
\`\`\`bash
npx eas-cli build -p android --profile production
\`\`\`
`
      );
    }
  } else if (isNextJs) {
    // Next.js 14 project
    if (!fileMap.has("package.json")) {
      fileMap.set(
        "package.json",
        JSON.stringify(
          {
            name: safeName,
            version: "0.1.0",
            private: true,
            scripts: {
              dev: "next dev",
              build: "next build",
              start: "next start",
              lint: "next lint",
            },
            dependencies: {
              next: "^14.2.15",
              react: "^18.3.1",
              "react-dom": "^18.3.1",
              "lucide-react": "^0.453.0",
              clsx: "^2.1.1",
              "tailwind-merge": "^2.5.4",
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
        )
      );
    }

    if (!fileMap.has("next.config.mjs") && !fileMap.has("next.config.js")) {
      fileMap.set("next.config.mjs", `/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nexport default nextConfig;\n`);
    }

    if (!fileMap.has("README.md") && !fileMap.has("readme.md")) {
      fileMap.set(
        "README.md",
        `# ${projectName} (Next.js 14 Full-Stack)

Built with **BYT AI Builder**.

## 🚀 Getting Started Locally

1. **Install dependencies**:
\`\`\`bash
npm install
\`\`\`

2. **Start development server**:
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.
`
      );
    }
  } else {
    // Standard Vite + React
    if (!fileMap.has("index.html")) {
      fileMap.set(
        "index.html",
        `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-background text-foreground antialiased min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
      );
    }

    if (!fileMap.has("package.json")) {
      fileMap.set(
        "package.json",
        JSON.stringify(
          {
            name: safeName,
            private: true,
            version: "0.1.0",
            type: "module",
            scripts: {
              dev: "vite",
              build: "vite build",
              preview: "vite preview",
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
              vite: "^5.4.9",
              tailwindcss: "^3.4.14",
              autoprefixer: "^10.4.20",
              postcss: "^8.4.47",
            },
          },
          null,
          2
        )
      );
    }

    if (!fileMap.has("vite.config.js") && !fileMap.has("vite.config.ts")) {
      fileMap.set(
        "vite.config.js",
        `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    cors: true,
  },
});
`
      );
    }

    if (!fileMap.has("README.md") && !fileMap.has("readme.md")) {
      fileMap.set(
        "README.md",
        `# ${projectName} (Vite + React)

Built with **BYT AI Builder**.

## 🚀 Getting Started Locally

1. **Install dependencies**:
\`\`\`bash
npm install
\`\`\`

2. **Start development server**:
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:5173](http://localhost:5173) in your browser.
`
      );
    }
  }

  // Add all files into zip using Array.from to avoid TS downlevel iteration issues
  const entries = Array.from(fileMap.entries());
  for (const [path, content] of entries) {
    zip.file(path, content);
  }

  // Generate zip file blob
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  // Trigger browser download
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
