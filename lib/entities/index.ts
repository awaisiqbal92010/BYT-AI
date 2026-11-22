/**
 * Base44-style Pre-loaded Databases & Entity Schemas
 *
 * Provides ready-to-use domain models, relational schemas, seed datasets,
 * and automatic mock REST/Postgres generators for the AI generation pipeline.
 */

export interface EntityField {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "uuid" | "json" | "array";
  required?: boolean;
  unique?: boolean;
  references?: {
    entity: string;
    field: string;
  };
  description: string;
  example: any;
}

export interface EntitySchema {
  name: string;
  description: string;
  primaryKey: string;
  fields: EntityField[];
  seedData: Record<string, any>[];
}

export interface DomainPreset {
  id: string;
  name: string;
  description: string;
  entities: Record<string, EntitySchema>;
}

export const PRELOADED_DOMAINS: Record<string, DomainPreset> = {
  ecommerce: {
    id: "ecommerce",
    name: "E-Commerce & Retail",
    description: "Storefront catalog, shopping cart, customer checkout, orders, and product reviews.",
    entities: {
      products: {
        name: "products",
        description: "Merchandise catalog items",
        primaryKey: "id",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true, description: "Product identifier", example: "prod_01h8a" },
          { name: "title", type: "string", required: true, description: "Display title", example: "Wireless Noise-Cancelling Headphones" },
          { name: "slug", type: "string", required: true, unique: true, description: "SEO URL slug", example: "wireless-noise-cancelling-headphones" },
          { name: "price", type: "number", required: true, description: "Price in USD", example: 199.99 },
          { name: "stock", type: "number", required: true, description: "Available stock count", example: 45 },
          { name: "category", type: "string", required: true, description: "Product category", example: "Audio" },
          { name: "rating", type: "number", description: "Average customer rating (0-5)", example: 4.8 },
          { name: "is_active", type: "boolean", description: "Whether product is active for purchase", example: true },
        ],
        seedData: [
          { id: "prod_01", title: "Acoustic Pro Studio Headphones", slug: "acoustic-pro-headphones", price: 249.00, stock: 32, category: "Audio", rating: 4.9, is_active: true },
          { id: "prod_02", title: "Ergonomic Mechanical Keyboard", slug: "ergonomic-mechanical-keyboard", price: 129.50, stock: 78, category: "Peripherals", rating: 4.7, is_active: true },
          { id: "prod_03", title: "UltraWide 34-Inch Curved Monitor", slug: "ultrawide-34-curved-monitor", price: 549.99, stock: 14, category: "Displays", rating: 4.8, is_active: true },
          { id: "prod_04", title: "Precision Wireless Gaming Mouse", slug: "precision-wireless-mouse", price: 79.99, stock: 110, category: "Peripherals", rating: 4.6, is_active: true },
        ],
      },
      customers: {
        name: "customers",
        description: "Registered shoppers and guests",
        primaryKey: "id",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true, description: "Customer ID", example: "cust_101" },
          { name: "email", type: "string", required: true, unique: true, description: "Email address", example: "sarah.chen@example.com" },
          { name: "full_name", type: "string", required: true, description: "Full name", example: "Sarah Chen" },
          { name: "loyalty_tier", type: "string", description: "Membership tier (bronze, silver, gold)", example: "gold" },
        ],
        seedData: [
          { id: "cust_101", email: "sarah.chen@example.com", full_name: "Sarah Chen", loyalty_tier: "gold" },
          { id: "cust_102", email: "marcus.vance@example.com", full_name: "Marcus Vance", loyalty_tier: "silver" },
        ],
      },
      orders: {
        name: "orders",
        description: "Customer checkout transactions",
        primaryKey: "id",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true, description: "Order ID", example: "ord_901" },
          { name: "customer_id", type: "uuid", required: true, references: { entity: "customers", field: "id" }, description: "Purchaser ID", example: "cust_101" },
          { name: "status", type: "string", required: true, description: "Order status (pending, paid, shipped, delivered)", example: "paid" },
          { name: "total_amount", type: "number", required: true, description: "Total charged", example: 378.50 },
          { name: "created_at", type: "date", required: true, description: "Timestamp created", example: "2026-11-20T10:14:00Z" },
        ],
        seedData: [
          { id: "ord_901", customer_id: "cust_101", status: "paid", total_amount: 378.50, created_at: "2026-11-20T10:14:00Z" },
          { id: "ord_902", customer_id: "cust_102", status: "shipped", total_amount: 549.99, created_at: "2026-11-21T09:30:00Z" },
        ],
      },
    },
  },

  saas: {
    id: "saas",
    name: "SaaS Subscription & Billing",
    description: "Tenants, seat management, subscription tiers, feature flags, and usage metering.",
    entities: {
      organizations: {
        name: "organizations",
        description: "Customer multi-tenant accounts",
        primaryKey: "id",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true, description: "Org ID", example: "org_alpha" },
          { name: "name", type: "string", required: true, description: "Company Name", example: "Acme Cloud Corp" },
          { name: "plan", type: "string", required: true, description: "Plan tier (starter, pro, enterprise)", example: "pro" },
          { name: "seat_limit", type: "number", required: true, description: "Max allocated team seats", example: 25 },
        ],
        seedData: [
          { id: "org_alpha", name: "Acme Cloud Corp", plan: "pro", seat_limit: 25 },
          { id: "org_beta", name: "Helios Robotics", plan: "enterprise", seat_limit: 200 },
        ],
      },
      users: {
        name: "users",
        description: "Organization team members",
        primaryKey: "id",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true, description: "User ID", example: "usr_401" },
          { name: "org_id", type: "uuid", required: true, references: { entity: "organizations", field: "id" }, description: "Tenant org ID", example: "org_alpha" },
          { name: "email", type: "string", required: true, description: "Work email", example: "alex@acme.io" },
          { name: "role", type: "string", required: true, description: "Role (admin, member, viewer)", example: "admin" },
        ],
        seedData: [
          { id: "usr_401", org_id: "org_alpha", email: "alex@acme.io", role: "admin" },
          { id: "usr_402", org_id: "org_alpha", email: "elena@acme.io", role: "member" },
          { id: "usr_403", org_id: "org_beta", email: "devon@helios.ai", role: "admin" },
        ],
      },
    },
  },

  crm: {
    id: "crm",
    name: "CRM & Sales Pipeline",
    description: "Deals, qualified leads, accounts, contact interactions, and sales stages.",
    entities: {
      leads: {
        name: "leads",
        description: "Inbound prospects and leads",
        primaryKey: "id",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true, description: "Lead ID", example: "lead_01" },
          { name: "company", type: "string", required: true, description: "Prospect company", example: "AeroDynamics" },
          { name: "contact_name", type: "string", required: true, description: "Primary contact", example: "Jordan Hayes" },
          { name: "deal_value", type: "number", required: true, description: "Estimated deal value", example: 45000 },
          { name: "stage", type: "string", required: true, description: "Pipeline stage (prospect, discovery, proposal, closed-won)", example: "proposal" },
        ],
        seedData: [
          { id: "lead_01", company: "AeroDynamics", contact_name: "Jordan Hayes", deal_value: 45000, stage: "proposal" },
          { id: "lead_02", company: "NextGen Bio", contact_name: "Priya Patel", deal_value: 92000, stage: "discovery" },
          { id: "lead_03", company: "Quantum Labs", contact_name: "Kenji Sato", deal_value: 120000, stage: "closed-won" },
        ],
      },
    },
  },

  project_management: {
    id: "project_management",
    name: "Project Management & Sprints",
    description: "Workspaces, boards, sprint epics, tasks, Kanban columns, and assignments.",
    entities: {
      tasks: {
        name: "tasks",
        description: "Work items and bug tickets",
        primaryKey: "id",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true, description: "Task ID", example: "task_01" },
          { name: "title", type: "string", required: true, description: "Issue title", example: "Implement OAuth2 PKCE flow" },
          { name: "priority", type: "string", required: true, description: "Priority (low, medium, high, urgent)", example: "high" },
          { name: "status", type: "string", required: true, description: "Status (backlog, todo, in_progress, review, done)", example: "in_progress" },
          { name: "assignee", type: "string", description: "Assigned member", example: "Devon M." },
          { name: "points", type: "number", description: "Fibonacci story points", example: 5 },
        ],
        seedData: [
          { id: "task_01", title: "Implement OAuth2 PKCE flow", priority: "high", status: "in_progress", assignee: "Devon M.", points: 5 },
          { id: "task_02", title: "Refactor database connection pool", priority: "urgent", status: "review", assignee: "Sarah C.", points: 8 },
          { id: "task_03", title: "Redesign analytics KPI widget", priority: "medium", status: "todo", assignee: "Alex R.", points: 3 },
          { id: "task_04", title: "Add end-to-end sandbox test suite", priority: "high", status: "done", assignee: "Devon M.", points: 5 },
        ],
      },
    },
  },

  healthcare: {
    id: "healthcare",
    name: "Healthcare & Patient Portal",
    description: "Patients, physician schedules, appointments, clinical vitals, and medication prescriptions.",
    entities: {
      appointments: {
        name: "appointments",
        description: "Clinical patient appointments",
        primaryKey: "id",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true, description: "Appointment ID", example: "apt_1" },
          { name: "patient_name", type: "string", required: true, description: "Patient name", example: "Clara Oswald" },
          { name: "doctor", type: "string", required: true, description: "Attending physician", example: "Dr. Gregory House" },
          { name: "date_time", type: "date", required: true, description: "Scheduled time", example: "2026-11-25T14:00:00Z" },
          { name: "department", type: "string", required: true, description: "Department clinic", example: "Cardiology" },
          { name: "status", type: "string", required: true, description: "Status (scheduled, completed, cancelled)", example: "scheduled" },
        ],
        seedData: [
          { id: "apt_1", patient_name: "Clara Oswald", doctor: "Dr. Gregory House", date_time: "2026-11-25T14:00:00Z", department: "Diagnostics", status: "scheduled" },
          { id: "apt_2", patient_name: "Arthur Dent", doctor: "Dr. Beverly Crusher", date_time: "2026-11-26T10:30:00Z", department: "General Medicine", status: "scheduled" },
        ],
      },
    },
  },

  social: {
    id: "social",
    name: "Social Network & Feed",
    description: "User profiles, dynamic activity feeds, nested comments, and social reactions.",
    entities: {
      posts: {
        name: "posts",
        description: "Timeline posts and updates",
        primaryKey: "id",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true, description: "Post ID", example: "post_01" },
          { name: "author", type: "string", required: true, description: "Author handle", example: "@sarah_dev" },
          { name: "content", type: "string", required: true, description: "Post text", example: "Just launched our live code preview feature! 🚀" },
          { name: "likes_count", type: "number", description: "Total hearts", example: 142 },
          { name: "comments_count", type: "number", description: "Total replies", example: 28 },
          { name: "created_at", type: "date", required: true, description: "Creation date", example: "2026-11-21T08:00:00Z" },
        ],
        seedData: [
          { id: "post_01", author: "@sarah_dev", content: "Just launched our live code preview feature! 🚀 Real microVMs in seconds.", likes_count: 142, comments_count: 28, created_at: "2026-11-21T08:00:00Z" },
          { id: "post_02", author: "@alex_builds", content: "Anti-AI slop design is the future. Clean typography, genuine hierarchy.", likes_count: 89, comments_count: 15, created_at: "2026-11-21T09:15:00Z" },
        ],
      },
    },
  },

  fintech: {
    id: "fintech",
    name: "Fintech & Banking",
    description: "Account balances, ledger transactions, card security, and currency conversions.",
    entities: {
      transactions: {
        name: "transactions",
        description: "Banking ledger entries",
        primaryKey: "id",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true, description: "Transaction ID", example: "txn_501" },
          { name: "amount", type: "number", required: true, description: "Amount (positive = credit, negative = debit)", example: -42.50 },
          { name: "currency", type: "string", required: true, description: "Currency code (USD, EUR, GBP)", example: "USD" },
          { name: "merchant", type: "string", required: true, description: "Counterparty / Merchant", example: "Coffee Roasters" },
          { name: "category", type: "string", required: true, description: "Expense category", example: "Dining" },
          { name: "timestamp", type: "date", required: true, description: "Timestamp", example: "2026-11-21T11:20:00Z" },
        ],
        seedData: [
          { id: "txn_501", amount: -42.50, currency: "USD", merchant: "Coffee Roasters", category: "Dining", timestamp: "2026-11-21T11:20:00Z" },
          { id: "txn_502", amount: 3500.00, currency: "USD", merchant: "Stripe Payout", category: "Income", timestamp: "2026-11-20T17:00:00Z" },
          { id: "txn_503", amount: -12.99, currency: "USD", merchant: "Cloud Hosting", category: "Software", timestamp: "2026-11-19T03:12:00Z" },
        ],
      },
    },
  },

  ai_ops: {
    id: "ai_ops",
    name: "AI & Model Operations",
    description: "LLM prompts, token completions, latency telemetry, eval scores, and human feedback.",
    entities: {
      generations: {
        name: "generations",
        description: "AI generation telemetry and traces",
        primaryKey: "id",
        fields: [
          { name: "id", type: "uuid", required: true, unique: true, description: "Generation trace ID", example: "gen_01" },
          { name: "model", type: "string", required: true, description: "Model name", example: "gemini-2.0-flash" },
          { name: "tokens_prompt", type: "number", required: true, description: "Input tokens", example: 450 },
          { name: "tokens_completion", type: "number", required: true, description: "Output tokens", example: 820 },
          { name: "latency_ms", type: "number", required: true, description: "Latency in ms", example: 1240 },
          { name: "quality_score", type: "number", description: "Score 0.0 - 1.0", example: 0.98 },
        ],
        seedData: [
          { id: "gen_01", model: "gemini-2.0-flash", tokens_prompt: 450, tokens_completion: 820, latency_ms: 1240, quality_score: 0.98 },
          { id: "gen_02", model: "codestral-latest", tokens_prompt: 620, tokens_completion: 1100, latency_ms: 1850, quality_score: 0.95 },
        ],
      },
    },
  },
};

/**
 * Returns SQL DDL statements for a given domain preset to inject into sandbox or Postgres.
 */
export function generatePostgresDdl(domainId: string): string {
  const domain = PRELOADED_DOMAINS[domainId];
  if (!domain) return "-- No schema found for domain: " + domainId;

  const statements: string[] = [];

  for (const [entityName, entity] of Object.entries(domain.entities)) {
    const colDefs = entity.fields.map((f) => {
      let pgType = "TEXT";
      if (f.type === "number") pgType = "NUMERIC";
      if (f.type === "boolean") pgType = "BOOLEAN";
      if (f.type === "date") pgType = "TIMESTAMPTZ";
      if (f.type === "json") pgType = "JSONB";

      let constraints = "";
      if (f.name === entity.primaryKey) constraints += " PRIMARY KEY";
      if (f.required && f.name !== entity.primaryKey) constraints += " NOT NULL";
      if (f.unique && f.name !== entity.primaryKey) constraints += " UNIQUE";
      if (f.references) constraints += ` REFERENCES ${f.references.entity}(${f.references.field})`;

      return `  "${f.name}" ${pgType}${constraints}`;
    });

    statements.push(`CREATE TABLE IF NOT EXISTS "${entityName}" (\n${colDefs.join(",\n")}\n);`);

    // Insert seeds
    if (entity.seedData && entity.seedData.length > 0) {
      for (const row of entity.seedData) {
        const keys = Object.keys(row).map((k) => `"${k}"`).join(", ");
        const values = Object.values(row)
          .map((v) => (typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : v))
          .join(", ");
        statements.push(`INSERT INTO "${entityName}" (${keys}) VALUES (${values}) ON CONFLICT DO NOTHING;`);
      }
    }
  }

  return statements.join("\n\n");
}

/**
 * Returns formatted JSON mock database for client-side local-storage or mock server.
 */
export function getDomainSeedJson(domainId: string): Record<string, any[]> {
  const domain = PRELOADED_DOMAINS[domainId];
  if (!domain) return {};

  const result: Record<string, any[]> = {};
  for (const [entityName, entity] of Object.entries(domain.entities)) {
    result[entityName] = entity.seedData;
  }
  return result;
}

/**
 * Suggests the best matching pre-loaded domain preset from a user's prompt.
 */
export function detectDomainFromPrompt(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  if (lower.includes("shop") || lower.includes("store") || lower.includes("product") || lower.includes("cart") || lower.includes("order") || lower.includes("ecommerce")) {
    return "ecommerce";
  }
  if (lower.includes("crm") || lower.includes("deal") || lower.includes("lead") || lower.includes("pipeline") || lower.includes("sales")) {
    return "crm";
  }
  if (lower.includes("tenant") || lower.includes("saas") || lower.includes("subscription") || lower.includes("seat") || lower.includes("billing")) {
    return "saas";
  }
  if (lower.includes("task") || lower.includes("kanban") || lower.includes("sprint") || lower.includes("project management") || lower.includes("scrum") || lower.includes("todo")) {
    return "project_management";
  }
  if (lower.includes("patient") || lower.includes("health") || lower.includes("clinic") || lower.includes("doctor") || lower.includes("appointment") || lower.includes("medical")) {
    return "healthcare";
  }
  if (lower.includes("post") || lower.includes("feed") || lower.includes("social") || lower.includes("comment") || lower.includes("follower")) {
    return "social";
  }
  if (lower.includes("bank") || lower.includes("wallet") || lower.includes("transaction") || lower.includes("payment") || lower.includes("money") || lower.includes("fintech")) {
    return "fintech";
  }
  if (lower.includes("model") || lower.includes("eval") || lower.includes("prompt") || lower.includes("ai ops") || lower.includes("llm")) {
    return "ai_ops";
  }
  return null;
}
