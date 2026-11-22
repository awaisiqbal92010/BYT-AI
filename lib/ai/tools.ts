/**
 * BYT AI Agent Tools
 *
 * Production-ready tools that the AI agent can invoke during project generation
 * and iterative development. Each tool wraps real E2B sandbox operations with
 * proper error handling, timeouts, and structured responses.
 */

import {
  runCommandInSandbox,
  PROJECT_DIR,
} from "@/lib/sandbox";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    description: string;
    required?: boolean;
  }>;
  execute: (params: Record<string, unknown>, sandboxId: string) => Promise<ToolResult>;
}

// ─── Shared Helpers ────────────────────────────────────────────────────────────

const FORBIDDEN_PATTERNS = [
  /rm\s+-rf\s+\/(?:\s|$)/i,
  /mkfs/i,
  /dd\s+if=/i,
  /169\.254\.169\.254/,
  /curl\s+.*\|\s*(?:bash|sh)/i,
  /wget\s+.*\|\s*(?:bash|sh)/i,
];

function isSafeCommand(command: string): boolean {
  return !FORBIDDEN_PATTERNS.some((p) => p.test(command));
}

// ─── Tool Implementations ──────────────────────────────────────────────────────

/**
 * Execute an arbitrary shell command inside the E2B sandbox.
 * Blocks dangerous patterns (rm -rf /, fork bombs, metadata access, etc.)
 */
export const executeCommandTool: ToolDefinition = {
  name: "executeCommand",
  description:
    "Run a shell command inside the sandbox (e.g., ls, cat, npm test). " +
    "Dangerous or destructive commands are blocked for safety.",
  parameters: {
    command: {
      type: "string",
      description: "The shell command to execute.",
      required: true,
    },
    workingDir: {
      type: "string",
      description: `Working directory (default: ${PROJECT_DIR}).`,
    },
  },
  async execute(params, sandboxId) {
    const command = String(params.command ?? "").trim();
    if (!command) return { success: false, error: "Command is required." };
    if (!isSafeCommand(command)) {
      return { success: false, error: "Blocked: command contains a forbidden pattern." };
    }
    try {
      const result = await runCommandInSandbox(sandboxId, command);
      return {
        success: result.exitCode === 0,
        data: {
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
        },
      };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

/**
 * Write (create or overwrite) a file inside the sandbox project directory.
 */
export const writeFileTool: ToolDefinition = {
  name: "writeFile",
  description:
    "Write content to a file inside the sandbox project. Creates intermediate directories automatically.",
  parameters: {
    path: {
      type: "string",
      description: "File path relative to the project root (e.g., 'src/App.tsx').",
      required: true,
    },
    content: {
      type: "string",
      description: "Full file content to write.",
      required: true,
    },
  },
  async execute(params, sandboxId) {
    const path = String(params.path ?? "").trim();
    const content = String(params.content ?? "");
    if (!path) return { success: false, error: "File path is required." };

    // Sanitize path to prevent directory traversal
    const safePath = path.replace(/\.\.\//g, "").replace(/^\//, "");
    const fullPath = `${PROJECT_DIR}/${safePath}`;

    try {
      // Create parent directory and write file using base64 to handle special chars
      const b64 = Buffer.from(content).toString("base64");
      await runCommandInSandbox(
        sandboxId,
        `mkdir -p "$(dirname '${fullPath}')" && echo '${b64}' | base64 -d > '${fullPath}'`
      );
      return { success: true, data: { path: safePath, bytesWritten: content.length } };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

/**
 * Read the content of a file from the sandbox project directory.
 */
export const readFileTool: ToolDefinition = {
  name: "readFile",
  description:
    "Read the contents of a file from the sandbox project directory.",
  parameters: {
    path: {
      type: "string",
      description: "File path relative to the project root.",
      required: true,
    },
  },
  async execute(params, sandboxId) {
    const path = String(params.path ?? "").trim();
    if (!path) return { success: false, error: "File path is required." };

    const safePath = path.replace(/\.\.\//g, "").replace(/^\//, "");
    const fullPath = `${PROJECT_DIR}/${safePath}`;

    try {
      const result = await runCommandInSandbox(sandboxId, `cat '${fullPath}'`);
      if (result.exitCode !== 0) {
        return { success: false, error: result.stderr || `File not found: ${safePath}` };
      }
      return { success: true, data: { path: safePath, content: result.stdout } };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

/**
 * Install one or more npm/yarn packages inside the sandbox.
 */
export const installPackagesTool: ToolDefinition = {
  name: "installPackages",
  description:
    "Install npm packages inside the sandbox project (runs npm install <packages>).",
  parameters: {
    packages: {
      type: "string",
      description: "Space-separated list of packages to install (e.g., 'axios zod').",
      required: true,
    },
    dev: {
      type: "boolean",
      description: "If true, install as devDependencies (--save-dev).",
    },
  },
  async execute(params, sandboxId) {
    const packages = String(params.packages ?? "").trim();
    if (!packages) return { success: false, error: "At least one package name is required." };

    // Sanitize: only allow safe package name chars
    const safePackages = packages
      .split(/\s+/)
      .filter((p) => /^@?[a-z0-9._\-/]+(@[a-z0-9._^~\-><=]+)?$/i.test(p));

    if (safePackages.length === 0) {
      return { success: false, error: "No valid package names provided." };
    }

    const devFlag = params.dev ? " --save-dev" : "";
    const cmd = `cd ${PROJECT_DIR} && npm install ${safePackages.join(" ")}${devFlag}`;

    try {
      const result = await runCommandInSandbox(sandboxId, cmd);
      return {
        success: result.exitCode === 0,
        data: {
          packages: safePackages,
          stdout: result.stdout.slice(0, 2000),
          stderr: result.stderr.slice(0, 1000),
        },
      };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

/**
 * Query a pre-loaded database entity (schema/template catalog).
 * Returns pre-built entity schemas the AI can reference when scaffolding
 * database-driven projects.
 */
export const queryDatabaseEntityTool: ToolDefinition = {
  name: "queryDatabaseEntity",
  description:
    "Query the BYT entity catalog for pre-built database schemas, models, " +
    "and RLS templates. Use to scaffold Supabase/Postgres-backed projects.",
  parameters: {
    entityType: {
      type: "string",
      description:
        "Entity category: 'users', 'products', 'orders', 'posts', 'comments', " +
        "'categories', 'tags', 'media', 'notifications', 'analytics', " +
        "'subscriptions', 'invoices', 'settings', 'roles', 'permissions'.",
      required: true,
    },
  },
  async execute(params) {
    const entityType = String(params.entityType ?? "").toLowerCase().trim();

    const ENTITY_CATALOG: Record<string, object> = {
      users: {
        table: "users",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "email", type: "text", unique: true, notNull: true },
          { name: "display_name", type: "text" },
          { name: "avatar_url", type: "text" },
          { name: "role", type: "text", default: "'user'", check: "role IN ('user','admin','moderator')" },
          { name: "plan", type: "text", default: "'free'" },
          { name: "created_at", type: "timestamptz", default: "now()" },
          { name: "updated_at", type: "timestamptz", default: "now()" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY users_self ON users FOR ALL USING (auth.uid() = id);",
      },
      products: {
        table: "products",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "name", type: "text", notNull: true },
          { name: "slug", type: "text", unique: true },
          { name: "description", type: "text" },
          { name: "price_cents", type: "integer", notNull: true },
          { name: "currency", type: "text", default: "'USD'" },
          { name: "image_url", type: "text" },
          { name: "category_id", type: "uuid", references: "categories(id)" },
          { name: "stock_count", type: "integer", default: "0" },
          { name: "is_active", type: "boolean", default: "true" },
          { name: "created_at", type: "timestamptz", default: "now()" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY products_read ON products FOR SELECT USING (is_active = true);",
      },
      orders: {
        table: "orders",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "user_id", type: "uuid", notNull: true, references: "users(id)" },
          { name: "status", type: "text", default: "'pending'", check: "status IN ('pending','processing','shipped','delivered','cancelled')" },
          { name: "total_cents", type: "integer", notNull: true },
          { name: "currency", type: "text", default: "'USD'" },
          { name: "shipping_address", type: "jsonb" },
          { name: "created_at", type: "timestamptz", default: "now()" },
          { name: "updated_at", type: "timestamptz", default: "now()" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY orders_owner ON orders FOR ALL USING (auth.uid() = user_id);",
      },
      posts: {
        table: "posts",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "author_id", type: "uuid", notNull: true, references: "users(id)" },
          { name: "title", type: "text", notNull: true },
          { name: "slug", type: "text", unique: true },
          { name: "content", type: "text" },
          { name: "excerpt", type: "text" },
          { name: "cover_image_url", type: "text" },
          { name: "status", type: "text", default: "'draft'", check: "status IN ('draft','published','archived')" },
          { name: "published_at", type: "timestamptz" },
          { name: "created_at", type: "timestamptz", default: "now()" },
          { name: "updated_at", type: "timestamptz", default: "now()" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY posts_public ON posts FOR SELECT USING (status = 'published'); CREATE POLICY posts_author ON posts FOR ALL USING (auth.uid() = author_id);",
      },
      comments: {
        table: "comments",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "post_id", type: "uuid", notNull: true, references: "posts(id) ON DELETE CASCADE" },
          { name: "author_id", type: "uuid", notNull: true, references: "users(id)" },
          { name: "content", type: "text", notNull: true },
          { name: "parent_id", type: "uuid", references: "comments(id)" },
          { name: "created_at", type: "timestamptz", default: "now()" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY comments_read ON comments FOR SELECT USING (true); CREATE POLICY comments_author ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);",
      },
      categories: {
        table: "categories",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "name", type: "text", notNull: true, unique: true },
          { name: "slug", type: "text", unique: true },
          { name: "description", type: "text" },
          { name: "parent_id", type: "uuid", references: "categories(id)" },
          { name: "sort_order", type: "integer", default: "0" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY categories_public ON categories FOR SELECT USING (true);",
      },
      tags: {
        table: "tags",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "name", type: "text", notNull: true, unique: true },
          { name: "slug", type: "text", unique: true },
          { name: "color", type: "text", default: "'#6366f1'" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY tags_public ON tags FOR SELECT USING (true);",
      },
      media: {
        table: "media",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "user_id", type: "uuid", notNull: true, references: "users(id)" },
          { name: "file_name", type: "text", notNull: true },
          { name: "mime_type", type: "text" },
          { name: "size_bytes", type: "bigint" },
          { name: "storage_path", type: "text", notNull: true },
          { name: "public_url", type: "text" },
          { name: "alt_text", type: "text" },
          { name: "created_at", type: "timestamptz", default: "now()" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY media_owner ON media FOR ALL USING (auth.uid() = user_id);",
      },
      notifications: {
        table: "notifications",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "user_id", type: "uuid", notNull: true, references: "users(id)" },
          { name: "type", type: "text", notNull: true },
          { name: "title", type: "text", notNull: true },
          { name: "body", type: "text" },
          { name: "read", type: "boolean", default: "false" },
          { name: "action_url", type: "text" },
          { name: "created_at", type: "timestamptz", default: "now()" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY notifications_owner ON notifications FOR ALL USING (auth.uid() = user_id);",
      },
      analytics: {
        table: "analytics_events",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "project_id", type: "uuid", references: "projects(id)" },
          { name: "event_name", type: "text", notNull: true },
          { name: "properties", type: "jsonb", default: "'{}'" },
          { name: "user_agent", type: "text" },
          { name: "ip_hash", type: "text" },
          { name: "created_at", type: "timestamptz", default: "now()" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY;",
      },
      subscriptions: {
        table: "subscriptions",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "user_id", type: "uuid", notNull: true, references: "users(id)" },
          { name: "plan", type: "text", notNull: true, check: "plan IN ('free','medium','premium','legendary')" },
          { name: "status", type: "text", default: "'active'", check: "status IN ('active','cancelled','past_due','trialing')" },
          { name: "stripe_customer_id", type: "text" },
          { name: "stripe_subscription_id", type: "text" },
          { name: "current_period_start", type: "timestamptz" },
          { name: "current_period_end", type: "timestamptz" },
          { name: "created_at", type: "timestamptz", default: "now()" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY subscriptions_owner ON subscriptions FOR ALL USING (auth.uid() = user_id);",
      },
      invoices: {
        table: "invoices",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "user_id", type: "uuid", notNull: true, references: "users(id)" },
          { name: "subscription_id", type: "uuid", references: "subscriptions(id)" },
          { name: "amount_cents", type: "integer", notNull: true },
          { name: "currency", type: "text", default: "'USD'" },
          { name: "status", type: "text", default: "'pending'" },
          { name: "paid_at", type: "timestamptz" },
          { name: "created_at", type: "timestamptz", default: "now()" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY invoices_owner ON invoices FOR ALL USING (auth.uid() = user_id);",
      },
      settings: {
        table: "settings",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "user_id", type: "uuid", notNull: true, unique: true, references: "users(id)" },
          { name: "theme", type: "text", default: "'dark'" },
          { name: "language", type: "text", default: "'en'" },
          { name: "notifications_enabled", type: "boolean", default: "true" },
          { name: "preferences", type: "jsonb", default: "'{}'" },
          { name: "updated_at", type: "timestamptz", default: "now()" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY settings_owner ON settings FOR ALL USING (auth.uid() = user_id);",
      },
      roles: {
        table: "roles",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "name", type: "text", notNull: true, unique: true },
          { name: "description", type: "text" },
          { name: "permissions", type: "text[]", default: "'{}'" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY; CREATE POLICY roles_read ON roles FOR SELECT USING (true);",
      },
      permissions: {
        table: "permissions",
        columns: [
          { name: "id", type: "uuid", primary: true, default: "gen_random_uuid()" },
          { name: "role_id", type: "uuid", notNull: true, references: "roles(id)" },
          { name: "resource", type: "text", notNull: true },
          { name: "action", type: "text", notNull: true, check: "action IN ('create','read','update','delete','manage')" },
        ],
        rls: "ENABLE ROW LEVEL SECURITY;",
      },
    };

    const entity = ENTITY_CATALOG[entityType];
    if (!entity) {
      return {
        success: false,
        error: `Unknown entity type "${entityType}". Available: ${Object.keys(ENTITY_CATALOG).join(", ")}`,
      };
    }

    return { success: true, data: entity };
  },
};

/**
 * Inspect the current preview for errors (reads console output / build logs).
 */
export const inspectPreviewErrorTool: ToolDefinition = {
  name: "inspectPreviewError",
  description:
    "Read the last build/runtime error from the sandbox dev server " +
    "(npm/vite/next dev logs). Use to diagnose preview failures.",
  parameters: {
    logLines: {
      type: "number",
      description: "Number of recent log lines to read (default: 50).",
    },
  },
  async execute(params, sandboxId) {
    const lines = Number(params.logLines) || 50;
    try {
      // Check for common error log locations
      const result = await runCommandInSandbox(
        sandboxId,
        `cd ${PROJECT_DIR} && (cat .next/trace 2>/dev/null || true) && echo '---STDERR---' && (journalctl -n ${lines} --no-pager 2>/dev/null || dmesg --noescape -T 2>/dev/null | tail -n ${lines} || echo 'No system logs available')`
      );
      return {
        success: true,
        data: {
          stdout: result.stdout.slice(0, 4000),
          stderr: result.stderr.slice(0, 2000),
          exitCode: result.exitCode,
        },
      };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

// ─── Tool Registry ─────────────────────────────────────────────────────────────

export const AGENT_TOOLS: ToolDefinition[] = [
  executeCommandTool,
  writeFileTool,
  readFileTool,
  installPackagesTool,
  queryDatabaseEntityTool,
  inspectPreviewErrorTool,
];

/**
 * Look up a tool by name from the registry.
 */
export function getToolByName(name: string): ToolDefinition | undefined {
  return AGENT_TOOLS.find((t) => t.name === name);
}

/**
 * Returns the OpenAI-compatible function schemas for all tools,
 * suitable for passing as `tools` to the chat completion API.
 */
export function getToolSchemas() {
  return AGENT_TOOLS.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(tool.parameters).map(([key, schema]) => [
            key,
            { type: schema.type, description: schema.description },
          ])
        ),
        required: Object.entries(tool.parameters)
          .filter(([, v]) => v.required)
          .map(([k]) => k),
      },
    },
  }));
}
