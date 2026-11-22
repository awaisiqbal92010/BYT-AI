import { callOpenRouter, callMistral, Message, ProviderError } from "./providers";
import { generateStitchBlueprint, buildStitchDesignInstructions, StitchUIBlueprint } from "../mcp/stitch";
import { SandboxFramework } from "../sandbox";
import { matchSkillsForPrompt } from "./skills-registry";
import { detectDomainFromPrompt, PRELOADED_DOMAINS } from "../entities";

export interface FilePlan {
  path: string;
  purpose: string;
}

export interface BuildPlan {
  projectName: string;
  description: string;
  framework?: SandboxFramework;
  files: FilePlan[];
  stitchBlueprint?: StitchUIBlueprint;
}

export interface ProjectFile {
  path: string;
  content: string;
  language?: string;
}

export interface PlanOptions {
  stitchApiKey?: string;
  useStitch?: boolean;
  framework?: SandboxFramework;
}

// Alias so consumers can import either name
export { generatePlan as planProject };

function getSystemPromptForFramework(framework: SandboxFramework = "vite-react"): string {
  if (framework === "nextjs") {
    return `You are a Principal Software Architect and Technical Planner for an AI-powered web builder.
Your job is to analyze the user's prompt and generate a complete, modular, and production-ready Next.js 14 App Router project architecture with Tailwind CSS and full-stack API capabilities.

You must respond with ONLY a valid JSON object matching this exact structure:
{
  "projectName": "Name of the web application",
  "description": "High level summary of the app and components",
  "files": [
    {
      "path": "package.json",
      "purpose": "Dependencies including next, react, react-dom, lucide-react, tailwindcss"
    },
    {
      "path": "next.config.mjs",
      "purpose": "Next.js configuration"
    },
    {
      "path": "app/layout.tsx",
      "purpose": "Root layout with font imports, metadata, and HTML structure"
    },
    {
      "path": "app/page.tsx",
      "purpose": "Main page component with interactive client features ('use client')"
    },
    {
      "path": "app/globals.css",
      "purpose": "Tailwind CSS directives and global theme styles"
    },
    {
      "path": "app/api/data/route.ts",
      "purpose": "Full-stack server API route handler returning JSON data"
    },
    {
      "path": "components/ComponentName.tsx",
      "purpose": "Modular UI component with clean styling and lucide icons"
    }
  ]
}

CRITICAL RULES:
1. Return ONLY the raw JSON object. Do not include markdown fences like \`\`\`json.
2. Include both client UI in app/page.tsx, components under components/, and at least one backend API route under app/api/.
3. Keep the file paths exact and standard.`;
  }

  if (framework === "react-native-expo") {
    return `You are a Principal Mobile Architect and Technical Planner for an AI-powered mobile app builder.
Your job is to analyze the user's prompt and generate a complete, modular, and production-ready React Native Expo (SDK 51) mobile application with native mobile components, APK/AAB build configuration, and responsive mobile UI.

You must respond with ONLY a valid JSON object matching this exact structure:
{
  "projectName": "Name of the mobile application",
  "description": "High level summary of the mobile app and screens",
  "files": [
    {
      "path": "package.json",
      "purpose": "Dependencies including expo, react-native, react, @expo/vector-icons, expo-status-bar, react-native-web"
    },
    {
      "path": "app.json",
      "purpose": "Expo app manifest configuration with android package, ios bundleId, and icons"
    },
    {
      "path": "App.tsx",
      "purpose": "Main root mobile screen with SafeAreaView, StatusBar, navigation or tab views, and state"
    },
    {
      "path": "metro.config.js",
      "purpose": "Metro bundler configuration"
    },
    {
      "path": "eas.json",
      "purpose": "EAS Build profile configuration for generating standalone APK and AAB files"
    },
    {
      "path": "components/MobileCard.tsx",
      "purpose": "Reusable React Native component using View, Text, TouchableOpacity, StyleSheet"
    }
  ]
}

CRITICAL RULES:
1. Return ONLY the raw JSON object. Do not include markdown fences like \`\`\`json.
2. Structure for React Native Expo with App.tsx as root and native components (View, Text, TouchableOpacity, StyleSheet).
3. Keep the file paths exact and standard.`;
  }

  return `You are a Principal Software Architect and Technical Planner for an AI-powered web builder.
Your job is to analyze the user's prompt and generate a complete, modular, and production-ready Vite + React + Tailwind CSS project architecture.

You must respond with ONLY a valid JSON object matching this exact structure:
{
  "projectName": "Name of the web application",
  "description": "High level summary of the app and components",
  "files": [
    {
      "path": "index.html",
      "purpose": "Root HTML entry point with viewport and title"
    },
    {
      "path": "package.json",
      "purpose": "Dependencies including react, react-dom, lucide-react, tailwindcss"
    },
    {
      "path": "vite.config.js",
      "purpose": "Vite configuration with react plugin and allowedHosts"
    },
    {
      "path": "src/main.jsx",
      "purpose": "React DOM entry point mounting App"
    },
    {
      "path": "src/App.jsx",
      "purpose": "Main parent component orchestrating layout and state"
    },
    {
      "path": "src/index.css",
      "purpose": "Tailwind CSS directives and custom styling"
    },
    {
      "path": "src/components/ComponentName.jsx",
      "purpose": "Detailed purpose of this specific component"
    }
  ]
}

CRITICAL RULES:
1. Return ONLY the raw JSON object. Do not include markdown fences like \`\`\`json, no explanations, no text before or after.
2. Ensure all required files for a working Vite + React application are present.
3. Break the UI into clean, composable components under \`src/components/\` with Lucide React icons.
4. Keep the file paths exact and standard.`;
}

/**
 * Strips any accidental markdown code blocks and extracts JSON object
 */
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned.trim();
}

/**
 * Generates a structured multi-file build plan using OpenRouter with automatic Mistral fallback.
 */
export async function generatePlan(
  userPrompt: string,
  options?: PlanOptions
): Promise<BuildPlan> {
  const framework: SandboxFramework = options?.framework || "vite-react";
  let stitchBlueprint: StitchUIBlueprint | undefined;
  let enhancedPrompt = userPrompt;

  if (options?.useStitch || options?.stitchApiKey) {
    try {
      stitchBlueprint = await generateStitchBlueprint(userPrompt, options.stitchApiKey);
      enhancedPrompt += `\n\n${buildStitchDesignInstructions(stitchBlueprint)}`;
    } catch (e) {
      console.warn("[Stitch MCP Warning]:", e);
    }
  }

  // Inject matched architecture & design skills
  const matchedSkills = matchSkillsForPrompt(userPrompt);
  if (matchedSkills.length > 0) {
    enhancedPrompt += `\n\n### ACTIVE ENTERPRISE ARCHITECTURE SKILLS:\n` +
      matchedSkills.map((s) => `- **${s.name}**: ${s.description}`).join("\n");
  }

  // Inject pre-loaded database & domain entities (Base44 style)
  const detectedDomain = detectDomainFromPrompt(userPrompt);
  if (detectedDomain && PRELOADED_DOMAINS[detectedDomain]) {
    const domainInfo = PRELOADED_DOMAINS[detectedDomain];
    enhancedPrompt += `\n\n### PRE-LOADED DATABASE & ENTITY SCHEMA AVAILABLE (${domainInfo.name}):\n` +
      `Entities available: ${Object.keys(domainInfo.entities).join(", ")}. Include mock entity datasets in src/data/mock-db.json or database seeds so the application has rich data immediately.`;
  }

  const systemPrompt = getSystemPromptForFramework(framework);

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Target Framework: ${framework.toUpperCase()}\nUser Prompt: "${enhancedPrompt}"\n\nGenerate the complete project plan JSON:`,
    },
  ];

  let rawResponse = "";

  // 1. Try OpenRouter
  try {
    rawResponse = await callOpenRouter(messages, { jsonMode: true, temperature: 0.1 });
  } catch (openRouterErr) {
    console.warn(
      "[Planner] OpenRouter planning failed. Falling back to Mistral (Codestral)...",
      openRouterErr instanceof ProviderError ? openRouterErr.message : openRouterErr
    );

    // 2. Resilient fallback to Mistral
    try {
      rawResponse = await callMistral(messages, { jsonMode: true, temperature: 0.1 });
    } catch (mistralErr) {
      throw new Error(
        `Planning failed across both OpenRouter and Mistral: ${
          mistralErr instanceof Error ? mistralErr.message : String(mistralErr)
        }`
      );
    }
  }

  // Parse JSON with 1-shot retry
  try {
    const cleaned = cleanJsonString(rawResponse);
    const parsed = JSON.parse(cleaned) as BuildPlan;

    if (!parsed.projectName || !Array.isArray(parsed.files) || parsed.files.length === 0) {
      throw new Error("Missing required fields in generated plan");
    }

    parsed.framework = framework;
    if (stitchBlueprint) {
      parsed.stitchBlueprint = stitchBlueprint;
    }

    return parsed;
  } catch (parseError) {
    console.warn("[Planner] JSON parsing failed, attempting fast retry extraction...", parseError);

    // Provide robust framework-specific fallback plan
    if (framework === "nextjs") {
      return {
        projectName: "Next.js Full Stack App",
        description: userPrompt,
        framework: "nextjs",
        files: [
          { path: "package.json", purpose: "Dependencies for Next.js 14 and Tailwind" },
          { path: "next.config.mjs", purpose: "Next.js configuration" },
          { path: "app/layout.tsx", purpose: "Root application layout" },
          { path: "app/page.tsx", purpose: "Main application page" },
          { path: "app/api/hello/route.ts", purpose: "Backend API route" },
        ],
      };
    } else if (framework === "react-native-expo") {
      return {
        projectName: "Expo Mobile App",
        description: userPrompt,
        framework: "react-native-expo",
        files: [
          { path: "package.json", purpose: "Expo SDK dependencies" },
          { path: "app.json", purpose: "Expo app manifest" },
          { path: "App.tsx", purpose: "Root mobile application screen" },
          { path: "metro.config.js", purpose: "Metro bundler configuration" },
          { path: "eas.json", purpose: "EAS build APK configuration" },
        ],
      };
    }

    return {
      projectName: "BYT AI Application",
      description: userPrompt,
      framework: "vite-react",
      files: [
        { path: "package.json", purpose: "Dependencies for Vite, React, and Tailwind" },
        { path: "vite.config.js", purpose: "Vite dev server configuration" },
        { path: "index.html", purpose: "HTML entry point" },
        { path: "src/main.jsx", purpose: "React mounting entry point" },
        { path: "src/App.jsx", purpose: "Main parent component" },
      ],
    };
  }
}
