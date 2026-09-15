/**
 * Seed script for soulofsoul — Convex version.
 * Run with: `bun run scripts/seed-convex.ts`
 *
 * Requires CONVEX_URL environment variable.
 * Creates demo accounts: member, clinician, supervisor, admin.
 * Calls the seedDemoData mutation on Convex.
 */

import { ConvexHttpClient } from "convex/browser";

async function main() {
  const convexUrl = process.env.CONVEX_URL;
  if (!convexUrl) {
    console.error("ERROR: CONVEX_URL environment variable is required.");
    console.error("Set it with: CONVEX_URL=https://your-deployment.convex.cloud bun run scripts/seed-convex.ts");
    process.exit(1);
  }

  console.log("🌱 Seeding soulofsoul demo data via Convex...");
  console.log(`   Convex URL: ${convexUrl}`);

  const client = new ConvexHttpClient(convexUrl);

  const result = await client.mutation("mutations:seedDemoData" as never, {});

  console.log(`\n${result.seeded ? "✅" : "ℹ️"} ${result.message}`);

  if (result.seeded) {
    console.log("\nDemo accounts:");
    console.log("   member@soulofsoul.dev     / demo1234");
    console.log("   clinician@soulofsoul.dev  / demo1234");
    console.log("   supervisor@soulofsoul.dev / demo1234");
    console.log("   admin@soulofsoul.dev      / demo1234");
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
