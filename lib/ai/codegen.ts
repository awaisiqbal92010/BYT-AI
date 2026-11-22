import { callMistral, callOpenRouter, Message, ProviderError } from "./providers";
import { BuildPlan, FilePlan } from "./orchestrator";
import type { SandboxFramework } from "@/lib/sandbox";

function getCodegenSystemPrompt(framework: string = "vite-react", filePath: string = ""): string {
  const ANTI_AI_SLOP_GUIDELINES = `
ANTI-AI-SLOP DESIGN & ENGINEERING PRINCIPLES (MANDATORY):
- NO GENERIC AI TROPES: Avoid cliché oversaturated neon-purple gradients everywhere. Use refined, elegant color palettes (dark zinc/slate tones, clean borders 'border-border/70', subtle brand accents).
- NO FAKE PLACEHOLDERS: NEVER write 'Lorem ipsum', 'Sample description', or placeholder text. Write realistic, domain-rich content and meaningful metric values.
- REAL FUNCTIONAL INTERACTIVITY: Buttons must actually do something (toggle state, filter items, calculate totals, open drawers, copy text).
- AUTHENTIC TYPOGRAPHY & CONTRAST: Ensure readable typography with proper tracking and line height. All text must pass WCAG contrast standards.`;

  if (framework === "react-native-expo") {
    return `You are a World-Class Senior React Native & Expo Mobile Engineer.
Your task is to write complete, production-ready code for a file in a React Native Expo (SDK 51) project.

${ANTI_AI_SLOP_GUIDELINES}

CRITICAL INSTRUCTIONS:
1. Return ONLY the raw file content. DO NOT wrap in markdown code fences like \`\`\`tsx or \`\`\`jsx.
2. DO NOT write explanations, greetings, or conversational notes.
3. For React Native screens and components:
   - Use 'react-native' primitives: View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, StatusBar.
   - Use '@expo/vector-icons' (e.g. Ionicons, Feather, MaterialCommunityIcons) or 'lucide-react-native' for mobile icons.
   - Style using StyleSheet.create with clean dark-mode colors, modern rounded corners (borderRadius: 12-24), and elegant spacing.
4. For json files (app.json, eas.json, package.json), output strictly valid raw JSON.
5. Write 100% complete, bug-free, interactive code with no truncation.`;
  }

  if (framework === "nextjs") {
    return `You are a World-Class Senior Full-Stack Next.js Engineer.
Your task is to write complete, production-ready code for a file in a Next.js 14 App Router project with Tailwind CSS.

${ANTI_AI_SLOP_GUIDELINES}

CRITICAL INSTRUCTIONS:
1. Return ONLY the raw file content. DO NOT wrap in markdown code fences like \`\`\`tsx or \`\`\`jsx.
2. DO NOT write explanations, greetings, or conversational notes.
3. If the file is in 'app/page.tsx' or uses client hooks (useState, useEffect, onClick), ALWAYS start with 'use client'; as the first line.
4. If the file is an API route ('app/api/...'), export async functions for HTTP methods (e.g., export async function GET(request: Request) { return NextResponse.json(...); }).
5. Use modern Tailwind CSS classes for styling (dark mode friendly, subtle glassmorphic borders, high visual aesthetics).
6. Use lucide-react icons for UI elements.
7. Write 100% complete, bug-free, interactive code with no placeholders or truncated code.`;
  }

  return `You are a World-Class Senior Frontend Engineer.
Your task is to write the complete, functional, production-ready code for a single file in a Vite + React + Tailwind CSS project.

${ANTI_AI_SLOP_GUIDELINES}

CRITICAL INSTRUCTIONS:
1. Return ONLY the raw file content. DO NOT wrap in markdown code fences like \`\`\`jsx or \`\`\`tsx.
2. DO NOT write explanations, greetings, or notes.
3. Use modern Tailwind CSS classes for styling (dark mode friendly, subtle borders, high visual aesthetics).
4. Use lucide-react icons for UI elements where appropriate.
5. All imports must strictly match the project structure.
6. For vite.config.js, ALWAYS configure: server: { host: '0.0.0.0', port: 5173, allowedHosts: true }
7. Write 100% complete, bug-free, interactive code with no placeholders or truncated code.`;
}

/**
 * Strips accidental markdown code block fences (```jsx, ```html, ```css, etc.)
 */
function stripMarkdownFences(raw: string, filePath?: string): string {
  let text = raw.trim();

  // Strip leading code fence
  if (text.startsWith("```")) {
    const firstNewline = text.indexOf("\n");
    if (firstNewline !== -1) {
      text = text.substring(firstNewline + 1);
    } else {
      text = text.replace(/^```[a-zA-Z0-9_-]*\s*/, "");
    }
  }

  // Strip trailing code fence
  if (text.endsWith("```")) {
    text = text.substring(0, text.lastIndexOf("```")).trimEnd();
  }

  // Auto-inject and enforce allowedHosts: true into vite.config
  if (filePath && filePath.includes("vite.config")) {
    text = text.replace(/allowedHosts:\s*['"][^'"]*['"]/g, "allowedHosts: true");
    text = text.replace(/allowedHosts:\s*\[[^\]]*\]/g, "allowedHosts: true");
    if (!text.includes("allowedHosts")) {
      if (text.includes("server:")) {
        text = text.replace(/server:\s*\{/, "server: {\n    allowedHosts: true,");
      } else if (text.includes("defineConfig({")) {
        text = text.replace(
          "defineConfig({",
          "defineConfig({\n  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },"
        );
      }
    }
  }

  return text;
}

/**
 * Generates the full source code for a specific file.
 * Uses Mistral (Codestral) as primary engine with automatic fallback
 * to OpenRouter if Mistral encounters an error.
 */
export async function generateFileContent(
  file: FilePlan,
  plan: BuildPlan,
  siblingsSummary: string = ""
): Promise<string> {
  const framework = plan.framework || "vite-react";
  const fileListSummary = plan.files
    .map((f) => `- ${f.path}: ${f.purpose}`)
    .join("\n");

  const promptContent = `PROJECT ARCHITECTURE:
Project Name: ${plan.projectName}
Framework: ${framework.toUpperCase()}
Project Description: ${plan.description}

ALL PROJECT FILES:
${fileListSummary}

${siblingsSummary ? `ALREADY GENERATED FILES SUMMARY:\n${siblingsSummary}\n` : ""}

TARGET FILE TO GENERATE:
Path: "${file.path}"
Purpose: "${file.purpose}"

Generate the complete raw file content for "${file.path}". Output ONLY raw code with zero markdown fences:`;

  const systemPrompt = getCodegenSystemPrompt(framework, file.path);

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: promptContent },
  ];

  try {
    // 1. Primary generation via Mistral (Codestral)
    const rawContent = await callMistral(messages, { temperature: 0.1 });
    return stripMarkdownFences(rawContent, file.path);
  } catch (mistralError) {
    console.warn(
      `[AI Engine] Mistral codegen failed for "${file.path}". Falling back to OpenRouter...`,
      mistralError instanceof ProviderError ? mistralError.message : mistralError
    );

    // 2. Automatic Fallback via OpenRouter
    try {
      const fallbackContent = await callOpenRouter(messages, { temperature: 0.1 });
      return stripMarkdownFences(fallbackContent, file.path);
    } catch (openRouterError) {
      console.warn(
        `[AI Engine] Both Mistral and OpenRouter failed for "${file.path}". Generating resilient synthesis fallback...`,
        openRouterError
      );
      return generateSynthesisFallback(file.path, file.purpose, framework, plan.projectName);
    }
  }
}

function generateSynthesisFallback(
  filePath: string,
  purpose: string,
  framework: SandboxFramework,
  projectName: string
): string {
  const ext = filePath.split(".").pop()?.toLowerCase();

  if (filePath === "package.json") {
    if (framework === "nextjs") {
      return JSON.stringify(
        {
          name: projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
          version: "0.1.0",
          private: true,
          scripts: { dev: "next dev -p 3000", build: "next build", start: "next start" },
          dependencies: {
            next: "^14.2.5",
            react: "^18.3.1",
            "react-dom": "^18.3.1",
            "lucide-react": "^0.453.0",
            tailwindcss: "^3.4.1",
          },
        },
        null,
        2
      );
    } else if (framework === "react-native-expo") {
      return JSON.stringify(
        {
          name: projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
          version: "1.0.0",
          scripts: { start: "expo start", android: "expo start --android", ios: "expo start --ios" },
          dependencies: {
            expo: "~51.0.28",
            react: "18.2.0",
            "react-native": "0.74.5",
            "expo-status-bar": "~1.12.1",
            "@expo/vector-icons": "^14.0.2",
            "react-native-web": "~0.19.10",
          },
        },
        null,
        2
      );
    }
    return JSON.stringify(
      {
        name: projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: { dev: "vite --host 0.0.0.0 --port 3000", build: "vite build" },
        dependencies: {
          react: "^18.3.1",
          "react-dom": "^18.3.1",
          "lucide-react": "^0.453.0",
        },
        devDependencies: {
          "@vitejs/plugin-react": "^4.3.1",
          vite: "^5.4.1",
          tailwindcss: "^3.4.1",
          autoprefixer: "^10.4.19",
          postcss: "^8.4.38",
        },
      },
      null,
      2
    );
  }

  if (filePath === "vite.config.js") {
    return `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    host: '0.0.0.0',\n    port: 3000,\n    allowedHosts: true,\n  },\n});\n`;
  }

  if (filePath === "index.html") {
    return `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${projectName}</title>\n  </head>\n  <body class="bg-slate-950 text-slate-100 antialiased">\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n`;
  }

  if (filePath.endsWith(".css")) {
    return `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  margin: 0;\n  background-color: #030712;\n  color: #f8fafc;\n  font-family: system-ui, -apple-system, sans-serif;\n}\n`;
  }

  if (ext === "json") {
    return `{\n  "name": "${projectName}",\n  "description": "${purpose}"\n}\n`;
  }

  const componentName = filePath.split("/").pop()?.replace(/\.[^/.]+$/, "") || "Component";
  return `"use client";\nimport React from "react";\nimport { Sparkles, Layers, ArrowRight } from "lucide-react";\n\nexport default function ${componentName}() {\n  return (\n    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-white shadow-xl backdrop-blur-xl">\n      <div className="flex items-center gap-2 text-violet-400 mb-2">\n        <Sparkles className="h-5 w-5" />\n        <h2 className="text-lg font-bold">${componentName}</h2>\n      </div>\n      <p className="text-sm text-slate-400 mb-4">${purpose}</p>\n      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-xs text-white transition-all">\n        <span>Explore Feature</span>\n        <ArrowRight className="h-3.5 w-3.5" />\n      </button>\n    </div>\n  );\n}\n`;
}
