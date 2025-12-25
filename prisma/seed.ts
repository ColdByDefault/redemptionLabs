import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      email: "personal@gmail.com",
      provider: "google",
      label: "Personal",
      isPrimary: true,
      notes: "Main personal account",
      usages: {
        create: [
          {
            service: "YouTube",
            category: "personal",
            description: "Main YouTube account",
          },
          {
            service: "Google Drive",
            category: "storage",
            description: "Personal documents",
          },
          { service: "Gmail", category: "email", description: "Primary email" },
          {
            service: "Netflix",
            category: "authentication",
            description: "Login with Google",
          },
        ],
      },
    },
  });

  const account2 = await prisma.account.create({
    data: {
      email: "work@gmail.com",
      provider: "google",
      label: "Work",
      isPrimary: false,
      notes: "Work-related services only",
      usages: {
        create: [
          {
            service: "Google Workspace",
            category: "work",
            description: "Company workspace",
          },
          {
            service: "Slack",
            category: "authentication",
            description: "Work Slack login",
          },
          {
            service: "Notion",
            category: "authentication",
            description: "Work Notion",
          },
        ],
      },
    },
  });

  const account3 = await prisma.account.create({
    data: {
      email: "user@icloud.com",
      provider: "icloud",
      label: "Apple",
      isPrimary: true,
      notes: "Apple ecosystem account",
      usages: {
        create: [
          {
            service: "iCloud Drive",
            category: "storage",
            description: "Apple ecosystem storage",
          },
          {
            service: "iCloud Backup",
            category: "backup",
            description: "iPhone/iPad backups",
          },
          {
            service: "Apple Music",
            category: "personal",
            description: "Music subscription",
          },
          {
            service: "App Store",
            category: "personal",
            description: "App purchases",
          },
        ],
      },
    },
  });

  const account4 = await prisma.account.create({
    data: {
      email: "dev@gmail.com",
      provider: "google",
      label: "Development",
      isPrimary: false,
      notes: "Development and testing account",
      usages: {
        create: [
          {
            service: "Firebase",
            category: "development",
            description: "Dev projects",
          },
          {
            service: "Google Cloud",
            category: "development",
            description: "GCP services",
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
      name: "Netflix",
      cost: 15.99,
      billingCycle: "monthly" as const,
      nextDueDate: new Date("2025-01-05"),
      status: "active" as const,
      category: "streaming" as const,
      notes: "Premium plan, 4K streaming",
    },
    {
      name: "Spotify",
      cost: 10.99,
      billingCycle: "monthly" as const,
      nextDueDate: new Date("2025-01-10"),
      status: "active" as const,
      category: "streaming" as const,
      notes: "Family plan",
    },
    {
      name: "GitHub Copilot",
      cost: 100,
      billingCycle: "yearly" as const,
      nextDueDate: new Date("2025-06-15"),
      status: "active" as const,
      category: "software" as const,
      notes: "Individual subscription",
    },
    {
      name: "Adobe Creative Cloud",
      cost: 54.99,
      billingCycle: "monthly" as const,
      nextDueDate: new Date("2025-01-01"),
      status: "active" as const,
      category: "software" as const,
      notes: "All Apps plan",
    },
    {
      name: "Xbox Game Pass",
      cost: 16.99,
      billingCycle: "monthly" as const,
      nextDueDate: new Date("2025-01-20"),
      status: "paused" as const,
      category: "gaming" as const,
      notes: "Ultimate tier",
    },
    {
      name: "AWS",
      cost: 50,
      billingCycle: "monthly" as const,
      nextDueDate: new Date("2025-01-03"),
      status: "active" as const,
      category: "cloud" as const,
      notes: "EC2 + S3 usage",
    },
  ];

  for (const sub of subscriptionsData) {
    await prisma.subscription.create({ data: sub });
  }

  console.log(`✅ Created ${subscriptionsData.length} subscriptions`);

  // ============================================================================
  // SEED TRANSACTIONS
  // ============================================================================

  const transactionsData = [
    {
      name: "Salary",
      amount: 5000,
      type: "income" as const,
      frequency: "monthly" as const,
      category: "salary" as const,
      dueDay: 1,
      isActive: true,
      notes: "Main job income",
    },
    {
      name: "Freelance Projects",
      amount: 1500,
      type: "income" as const,
      frequency: "monthly" as const,
      category: "freelance" as const,
      dueDay: 15,
      isActive: true,
      notes: "Side projects",
    },
    {
      name: "Dividend Income",
      amount: 2400,
      type: "income" as const,
      frequency: "yearly" as const,
      category: "investment" as const,
      dueDay: 1,
      isActive: true,
      notes: "Stock dividends",
    },
    {
      name: "Rent",
      amount: 1200,
      type: "expense" as const,
      frequency: "monthly" as const,
      category: "rent" as const,
      dueDay: 1,
      isActive: true,
      notes: "Apartment rent",
    },
    {
      name: "Electricity",
      amount: 80,
      type: "expense" as const,
      frequency: "monthly" as const,
      category: "utilities" as const,
      dueDay: 15,
      isActive: true,
      notes: "Electric bill",
    },
    {
      name: "Internet",
      amount: 60,
      type: "expense" as const,
      frequency: "monthly" as const,
      category: "utilities" as const,
      dueDay: 10,
      isActive: true,
      notes: "Fiber connection",
    },
    {
      name: "Health Insurance",
      amount: 200,
      type: "expense" as const,
      frequency: "monthly" as const,
      category: "insurance" as const,
      dueDay: 5,
      isActive: true,
      notes: "Medical coverage",
    },
    {
      name: "Car Insurance",
      amount: 1200,
      type: "expense" as const,
      frequency: "yearly" as const,
      category: "insurance" as const,
      dueDay: 15,
      isActive: true,
      notes: "Annual premium",
    },
    {
      name: "Gym Membership",
      amount: 50,
      type: "expense" as const,
      frequency: "monthly" as const,
      category: "healthcare" as const,
      dueDay: 1,
      isActive: true,
      notes: "Fitness center",
    },
    {
      name: "Groceries",
      amount: 400,
      type: "expense" as const,
      frequency: "monthly" as const,
      category: "food" as const,
      dueDay: 1,
      isActive: true,
      notes: "Monthly food budget",
    },
  ];

  for (const tx of transactionsData) {
    await prisma.transaction.create({ data: tx });
  }

  console.log(`✅ Created ${transactionsData.length} transactions`);

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
