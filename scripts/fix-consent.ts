import { db } from "../src/lib/db";

async function main() {
  const member = await db.user.findUnique({
    where: { email: "member@soulofsoul.dev" },
    include: { member: true },
  });
  if (member?.member) {
    await db.member.update({
      where: { userId: member.id },
      data: { consentResearchTelemetry: true },
    });
    console.log("✓ Updated member consentResearchTelemetry = true");
  }
}
main().finally(() => db.$disconnect());
