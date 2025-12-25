import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  await prisma.accountUsage.deleteMany();
  await prisma.account.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.transaction.deleteMany();

  console.log("📦 Cleared existing data");

  // ============================================================================
  // SEED ACCOUNTS
  // ============================================================================

  const account1 = await prisma.account.create({
    data: {
      email: "abo.ayash.yazan@gmail.com",
      provider: "google",
      label: "Main Personal",
      isPrimary: true,
      notes: "Main personal Google account",
      usages: {
        create: [
          {
            service: "Gmail",
            category: "email",
            description: "Main Gmail account",
          },
          {
            service: "Google",
            category: "personal",
            description: "Main Google account",
          },
          {
            service: "GitHub",
            category: "development",
            description: "GitHub account",
          },
          {
            service: "Squarespace",
            category: "other",
            description: "Squarespace and Domain",
          },
          {
            service: "Steam",
            category: "personal",
            description: "Steam gaming",
          },
          {
            service: "Spotify",
            category: "personal",
            description: "Spotify music",
          },
          {
            service: "Social Media",
            category: "social",
            description: "Social media accounts",
          },
        ],
      },
    },
  });

  const account2 = await prisma.account.create({
    data: {
      email: "stonylonesome7@icloud.com",
      provider: "icloud",
      label: "Apple",
      isPrimary: true,
      notes: "Apple iCloud account",
      usages: {
        create: [
          {
            service: "iCloud",
            category: "storage",
            description: "iCloud storage and services",
          },
          {
            service: "Steam",
            category: "personal",
            description: "Steam gaming (secondary)",
          },
        ],
      },
    },
  });

  const account3 = await prisma.account.create({
    data: {
      email: "yazan.abo-ayash@avarno.de",
      provider: "microsoft",
      label: "Work Avarno",
      isPrimary: false,
      notes: "Temporary work account at Avarno",
      usages: {
        create: [
          {
            service: "Avarno",
            category: "work",
            description: "Temp Work Avarno",
          },
          {
            service: "Atlassian",
            category: "work",
            description: "Jira/Confluence",
          },
          {
            service: "Microsoft 365",
            category: "work",
            description: "Microsoft Office and Teams",
          },
        ],
      },
    },
  });

  const account4 = await prisma.account.create({
    data: {
      email: "yazan.abo-ayash@education.gfn",
      provider: "microsoft",
      label: "School GFN",
      isPrimary: false,
      notes: "Temporary school account",
      usages: {
        create: [
          {
            service: "GFN Education",
            category: "education",
            description: "Temp School account",
          },
          {
            service: "Microsoft 365",
            category: "education",
            description: "Microsoft Office and Teams",
          },
        ],
      },
    },
  });

  console.log(
    `✅ Created ${4} accounts: ${account1.email}, ${account2.email}, ${
      account3.email
    }, ${account4.email}`
  );

  // ============================================================================
  // SEED SUBSCRIPTIONS
  // ============================================================================

  const subscriptionsData = [
    {
      name: "GitHub Copilot",
      cost: 37,
      billingCycle: "yearly" as const,
      nextDueDate: new Date("2026-01-01"),
      status: "active" as const,
      category: "software" as const,
      notes: "AI coding assistant",
    },
    {
      name: "Spotify",
      cost: 17,
      billingCycle: "monthly" as const,
      nextDueDate: new Date("2026-01-05"),
      status: "active" as const,
      category: "streaming" as const,
      notes: "Music streaming",
    },
    {
      name: "Google One Pro",
      cost: 0,
      billingCycle: "yearly" as const,
      nextDueDate: new Date("2026-08-01"),
      status: "active" as const,
      category: "cloud" as const,
      notes: "Google Pro subscription",
    },
  ];

  for (const sub of subscriptionsData) {
    await prisma.subscription.create({ data: sub });
  }

  console.log(`✅ Created ${subscriptionsData.length} subscriptions`);

  // ============================================================================
  // SEED TRANSACTIONS
  // ============================================================================

  // No transactions seeded - user requested blank

  console.log(`✅ Created 0 transactions (left blank as requested)`);

  console.log("🎉 Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
