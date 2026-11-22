import { callMistral, callOpenRouter, Message, ProviderError } from "./providers";
import { BuildPlan, FilePlan } from "./orchestrator";

function getCodegenSystemPrompt(framework: string = "vite-react", filePath: string = ""): string {
  if (framework === "react-native-expo") {
    return `You are a World-Class Senior React Native & Expo Mobile Engineer.
Your task is to write complete, production-ready code for a file in a React Native Expo (SDK 51) project.

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
      throw new Error(
        `Codegen failed on both Mistral and OpenRouter fallback for "${file.path}": ${
          openRouterError instanceof Error ? openRouterError.message : String(openRouterError)
        }`
      );
    }
  }
}
