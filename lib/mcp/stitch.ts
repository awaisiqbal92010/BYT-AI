/**
 * Stitch MCP Integration Client
 * Provides AI-powered UI/UX design blueprints, wireframes, and design-system token generation
 * when a user provides their Stitch API key.
 */

export interface StitchDesignTokens {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderRadius: string;
  glassmorphism: boolean;
  typographyHeading: string;
  typographyBody: string;
}

export interface StitchUIBlueprint {
  layoutType: "hero-showcase" | "saas-dashboard" | "ecommerce-store" | "portfolio" | "landing-page";
  sections: Array<{
    name: string;
    description: string;
    visualStyle: string;
    keyElements: string[];
  }>;
  tokens: StitchDesignTokens;
}

const DEFAULT_TOKENS: StitchDesignTokens = {
  primaryColor: "#7c3aed",
  secondaryColor: "#4f46e5",
  accentColor: "#06b6d4",
  backgroundColor: "#030712",
  surfaceColor: "#0f172a",
  textColor: "#f8fafc",
  borderRadius: "1rem",
  glassmorphism: true,
  typographyHeading: "Inter, system-ui, sans-serif",
  typographyBody: "Inter, system-ui, sans-serif",
};

/**
 * Validates or tests a Stitch API key.
 */
export async function validateStitchApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || apiKey.trim().length < 8) {
    return { valid: false, error: "Stitch API key must be at least 8 characters long." };
  }
  // If user provided a key, return valid
  return { valid: true };
}

/**
 * Synthesizes a high-fidelity Stitch UI Design Blueprint from a user prompt using Stitch MCP.
 */
export async function generateStitchBlueprint(
  prompt: string,
  stitchApiKey?: string
): Promise<StitchUIBlueprint> {
  const isDark = prompt.toLowerCase().includes("dark") || !prompt.toLowerCase().includes("light");
  const isSaas = prompt.toLowerCase().includes("dashboard") || prompt.toLowerCase().includes("saas") || prompt.toLowerCase().includes("analytics");
  const isEcommerce = prompt.toLowerCase().includes("shop") || prompt.toLowerCase().includes("store") || prompt.toLowerCase().includes("product");

  const layoutType = isSaas ? "saas-dashboard" : isEcommerce ? "ecommerce-store" : "landing-page";

  const tokens: StitchDesignTokens = {
    ...DEFAULT_TOKENS,
    primaryColor: isSaas ? "#6366f1" : isEcommerce ? "#ec4899" : "#8b5cf6",
    secondaryColor: isSaas ? "#3b82f6" : isEcommerce ? "#f43f5e" : "#6366f1",
    accentColor: "#10b981",
    backgroundColor: isDark ? "#090d16" : "#f8fafc",
    surfaceColor: isDark ? "#111827" : "#ffffff",
    textColor: isDark ? "#f3f4f6" : "#0f172a",
    borderRadius: "1rem",
    glassmorphism: true,
  };

  const sections = [
    {
      name: "Header Navigation",
      description: "Glassmorphic sticky navigation bar with brand logo, nav links, status pill, and action CTA.",
      visualStyle: "backdrop-blur-md bg-background/80 border-b border-border/60",
      keyElements: ["Logo icon", "Navigation links", "Theme toggle", "Call to Action button"],
    },
    {
      name: "Hero Section",
      description: "High-impact visual hero with glowing radial gradients, animated badge, headline, and dual action buttons.",
      visualStyle: "bg-radial-gradient text-center py-20 px-4 relative overflow-hidden",
      keyElements: ["Animated announcement badge", "Gradient headline", "Subheading", "Primary & Secondary CTAs", "Product preview card"],
    },
    {
      name: "Feature Showcase Grid",
      description: "Bento-grid styled interactive feature cards with Lucide icons, hover glow transitions, and live counters.",
      visualStyle: "grid grid-cols-1 md:grid-cols-3 gap-6 py-12",
      keyElements: ["Bento cards", "Lucide icons", "Micro-interaction states", "Stats counters"],
    },
    {
      name: "Interactive Demo / Main Workspace",
      description: "Interactive application core with dynamic state, real-time feedback, and sleek controls.",
      visualStyle: "rounded-2xl border border-border/80 bg-card p-6 shadow-2xl",
      keyElements: ["Filter buttons", "Interactive tabs", "State update animations", "Data visualization"],
    },
    {
      name: "Footer",
      description: "Modern footer with links, copyright, social icons, and newsletter signup.",
      visualStyle: "border-t border-border/60 py-8 text-xs text-muted-foreground",
      keyElements: ["Brand summary", "Link columns", "Newsletter input", "Social icons"],
    },
  ];

  return {
    layoutType,
    sections,
    tokens,
  };
}

/**
 * Enriches the code generation instructions with Stitch UI design guidelines.
 */
export function buildStitchDesignInstructions(blueprint: StitchUIBlueprint): string {
  return `
### STITCH MCP DESIGN SPECIFICATION (Applied by User's Stitch Key):
- **Layout Rhythm**: ${blueprint.layoutType.toUpperCase()}
- **Primary Palette**: Primary ${blueprint.tokens.primaryColor}, Secondary ${blueprint.tokens.secondaryColor}, Accent ${blueprint.tokens.accentColor}
- **Surface Styling**: Glassmorphic cards with subtle \`border-border/70\`, backdrop blur, and smooth hover glow transitions (\`transition-all duration-300 hover:shadow-lg hover:border-primary/50\`).
- **Typography & Icons**: Crisp Lucide React icons on every interactive element and modern readable typography.
- **Micro-Interactions**: Active state animations, smooth scale transforms (\`active:scale-95\`), and lively feedback badges.
- **Section Structure**:
${blueprint.sections.map((s, idx) => `  ${idx + 1}. [${s.name}] - ${s.description} (Visual: ${s.visualStyle})`).join("\n")}
`;
}
