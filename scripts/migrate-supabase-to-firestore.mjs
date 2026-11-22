/**
 * BYT Data Migration Script: Supabase SQL -> Firebase Firestore
 *
 * Runs automatically to extract data from Supabase tables (profiles, projects, usage_logs)
 * and imports them into Firebase Firestore collections (users, projects, usage).
 *
 * Usage:
 *   node scripts/migrate-supabase-to-firestore.mjs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey && privateKey.includes("\\n")) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}

let app;
if (getApps().length === 0) {
  if (clientEmail && privateKey) {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    app = initializeApp({ projectId });
  }
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function runMigration() {
  console.log("🚀 Starting Supabase -> Firebase Firestore Data Migration...");
  console.log(`📦 Target Firebase Project: ${projectId}`);

  let supabase = null;
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes("mock") && !supabaseKey.includes("mock")) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
      console.log(`🔗 Connected to Supabase at: ${supabaseUrl}`);
    } catch (err) {
      console.warn("⚠️ Could not connect to Supabase instance:", err.message);
    }
  } else {
    console.log("ℹ️ No live Supabase connection configured or mock detected. Skipping Supabase SQL remote pull.");
  }

  // 1. Migrate Profiles -> users/{uid}
  if (supabase) {
    console.log("\n--- Migrating Profiles -> users/{uid} ---");
    try {
      const { data: profiles, error } = await supabase.from("profiles").select("*");
      if (error) {
        console.warn("Could not query Supabase profiles table:", error.message);
      } else if (profiles && profiles.length > 0) {
        console.log(`Found ${profiles.length} profiles to migrate.`);
        for (const p of profiles) {
          const userRef = db.collection("users").doc(p.id);
          await userRef.set(
            {
              uid: p.id,
              githubUsername: p.github_username || null,
              plan: p.plan || "free",
              createdAt: p.created_at ? new Date(p.created_at) : FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          console.log(`  ✓ Migrated profile: ${p.id}`);
        }
      } else {
        console.log("No profiles found in Supabase.");
      }
    } catch (err) {
      console.warn("Profiles migration error:", err.message);
    }

    // 2. Migrate Projects -> projects/{projectId}
    console.log("\n--- Migrating Projects -> projects/{projectId} ---");
    try {
      const { data: projects, error } = await supabase.from("projects").select("*");
      if (error) {
        console.warn("Could not query Supabase projects table:", error.message);
      } else if (projects && projects.length > 0) {
        console.log(`Found ${projects.length} projects to migrate.`);
        for (const prj of projects) {
          const projectRef = db.collection("projects").doc(prj.id);
          await projectRef.set(
            {
              userId: prj.user_id,
              name: prj.name,
              slug: prj.slug || prj.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              description: prj.description || "",
              framework: prj.framework || "Next.js 14",
              files: prj.files || [],
              messages: prj.messages || [],
              previewUrl: prj.preview_url || null,
              isPublic: Boolean(prj.is_public),
              createdAt: prj.created_at ? new Date(prj.created_at) : FieldValue.serverTimestamp(),
              updatedAt: prj.updated_at ? new Date(prj.updated_at) : FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          console.log(`  ✓ Migrated project: ${prj.name} (${prj.id})`);
        }
      } else {
        console.log("No projects found in Supabase.");
      }
    } catch (err) {
      console.warn("Projects migration error:", err.message);
    }

    // 3. Migrate Usage Logs -> usage/{userId}/months/{period}
    console.log("\n--- Migrating Usage Logs -> usage/{userId}/months/{period} ---");
    try {
      const { data: usageLogs, error } = await supabase.from("usage_logs").select("*");
      if (error) {
        console.warn("Could not query Supabase usage_logs table:", error.message);
      } else if (usageLogs && usageLogs.length > 0) {
        console.log(`Found ${usageLogs.length} usage logs to migrate.`);
        for (const log of usageLogs) {
          const usageRef = db.collection("usage").doc(log.user_id).collection("months").doc(log.period);
          await usageRef.set(
            {
              promptCount: log.prompt_count || 0,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          console.log(`  ✓ Migrated usage: user ${log.user_id} period ${log.period}`);
        }
      } else {
        console.log("No usage logs found in Supabase.");
      }
    } catch (err) {
      console.warn("Usage logs migration error:", err.message);
    }
  }

  // 4. Seed default starter projects if collection is empty
  console.log("\n--- Checking default showcase projects in Firestore ---");
  try {
    const showcaseDoc = await db.collection("projects").doc("proj-1").get();
    if (!showcaseDoc.exists) {
      console.log("Seeding default showcase project (AI Developer Portfolio) into Firestore...");
      await db.collection("projects").doc("proj-1").set({
        userId: "system-showcase",
        name: "AI Developer Portfolio",
        slug: "ai-developer-portfolio",
        description: "Modern developer showcase with interactive project grid, skill badges, and dark mode.",
        framework: "Next.js 14",
        status: "live",
        previewUrl: "https://dev-portfolio.byt.site",
        isPublic: true,
        files: [
          {
            path: "app/page.tsx",
            content: `export default function Home() {\n  return (\n    <main className="min-h-screen p-8 bg-zinc-950 text-white">\n      <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AI Portfolio</h1>\n    </main>\n  );\n}`,
          },
        ],
        messages: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log("  ✓ Seeded default showcase project 'proj-1'");
    } else {
      console.log("  ✓ Showcase project already present in Firestore.");
    }
  } catch (seedErr) {
    console.warn("Showcase project seed warning:", seedErr.message);
  }

  console.log("\n✅ Migration process completed successfully!");
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
