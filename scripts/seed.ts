/**
 * Seed script — creates demo accounts for each role.
 * Run with: `bun run db:seed`
 *
 * Creates:
 *   member@soulofsoul.dev     / demo1234   (MEMBER role)
 *   clinician@soulofsoul.dev  / demo1234   (CLINICIAN role + Clinician profile)
 *   supervisor@soulofsoul.dev / demo1234   (SUPERVISOR role)
 *   admin@soulofsoul.dev      / demo1234   (ADMIN role)
 */

import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Seeding soulofsoul demo accounts...");

  const passwordHash = await bcrypt.hash("demo1234", 12);

  // ─── Member ───
  const member = await db.user.upsert({
    where: { email: "member@soulofsoul.dev" },
    update: {},
    create: {
      email: "member@soulofsoul.dev",
      name: "Demo Member",
      passwordHash,
      role: "MEMBER",
      ageVerified: true,
      birthYear: 1990,
      tier: 2,
      member: {
        create: {
          language: "en",
          consentAiCompanion: true,
          consentTelehealthRecord: false,
          consentResearchTelemetry: true, // demo: member opted into Pillar 2 research
          consentVoiceAgent: false,
        },
      },
    },
  });
  console.log(`  ✓ member@soulofsoul.dev (id: ${member.id})`);

  // ─── Clinician ───
  const clinicianUser = await db.user.upsert({
    where: { email: "clinician@soulofsoul.dev" },
    update: {},
    create: {
      email: "clinician@soulofsoul.dev",
      name: "Dr. Elena Rostova",
      passwordHash,
      role: "CLINICIAN",
      ageVerified: true,
      birthYear: 1978,
      tier: 4,
      clinician: {
        create: {
          name: "Dr. Elena Rostova",
          credentials: "PsyD, Licensed Clinical Psychologist",
          npi: "1538294716",
          specialties: JSON.stringify(["CBT", "Anxiety", "Trauma"]),
          modality: "video",
          licensureStates: JSON.stringify(["OR", "WA", "CA"]),
          rating: 4.9,
          sessionsCompleted: 842,
          inNetwork: true,
          nextAvailable: "Tue 2:00 PM",
        },
      },
    },
  });
  console.log(`  ✓ clinician@soulofsoul.dev (id: ${clinicianUser.id})`);

  // ─── Supervisor ───
  const supervisor = await db.user.upsert({
    where: { email: "supervisor@soulofsoul.dev" },
    update: {},
    create: {
      email: "supervisor@soulofsoul.dev",
      name: "Dev (On-call Supervisor)",
      passwordHash,
      role: "SUPERVISOR",
      ageVerified: true,
      birthYear: 1982,
      tier: 4,
    },
  });
  console.log(`  ✓ supervisor@soulofsoul.dev (id: ${supervisor.id})`);

  // ─── Admin ───
  const admin = await db.user.upsert({
    where: { email: "admin@soulofsoul.dev" },
    update: {},
    create: {
      email: "admin@soulofsoul.dev",
      name: "Enterprise Admin",
      passwordHash,
      role: "ADMIN",
      ageVerified: true,
      birthYear: 1975,
      tier: 4,
    },
  });
  console.log(`  ✓ admin@soulofsoul.dev (id: ${admin.id})`);

  // ─── Seed sample crisis events for supervisor console ───
  const existingEvents = await db.crisisEvent.count();
  if (existingEvents === 0) {
    await db.crisisEvent.createMany({
      data: [
        {
          userId: null,
          deidentifiedId: "User-7F3A",
          reason: "Suicidal ideation — high confidence (0.97)",
          language: "English",
          channel: "text",
          status: "pending",
          slaDeadline: new Date(Date.now() + 5 * 60 * 1000),
        },
        {
          userId: null,
          deidentifiedId: "User-9B21",
          reason: "Self-harm language",
          language: "English",
          channel: "voice",
          status: "reviewing",
          slaDeadline: new Date(Date.now() + 2 * 60 * 1000),
          disposition: "Outreach in progress",
        },
      ],
    });
    console.log("  ✓ 2 sample crisis events");
  }

  // ─── Seed sample enterprise contract ───
  const existingContracts = await db.enterpriseContract.count();
  if (existingContracts === 0) {
    await db.enterpriseContract.create({
      data: {
        name: "Northwind Tech (12k employees)",
        type: "Employer",
        members: 12480,
        slaUptime: 99.94,
        crisisPipelineAvailability: 100,
        status: "active",
        renewalDate: new Date("2027-03-15"),
      },
    });
    console.log("  ✓ Northwind Tech enterprise contract");
  }

  console.log("\n✅ Seed complete. Demo logins:");
  console.log("   member@soulofsoul.dev     / demo1234");
  console.log("   clinician@soulofsoul.dev  / demo1234");
  console.log("   supervisor@soulofsoul.dev / demo1234");
  console.log("   admin@soulofsoul.dev      / demo1234");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
