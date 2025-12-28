import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// ============================================================
// SEED DATA
// ============================================================

async function main(): Promise<void> {
  console.log("🌱 Starting database seeding...\n");

  // Clean existing data (in correct order to respect foreign keys)
  console.log("🧹 Cleaning existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.sectionTimestamp.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.oneTimeBill.deleteMany();
  await prisma.recurringExpense.deleteMany();
  await prisma.credit.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.income.deleteMany();
  await prisma.bank.deleteMany();
  await prisma.account.deleteMany();
  await prisma.email.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Existing data cleaned\n");

  // ============================================================
  // 1. CREATE USER
  // ============================================================
  console.log("👤 Creating demo user...");
  const hashedPassword = await hash("pa$$word", 12);

  const user = await prisma.user.create({
    data: {
      username: "demo",
      email: "demo@example.com",
      hashedPassword,
      enabledPlugins: ["accounts", "finance", "documents", "wishlist", "trash"],
    },
  });
  console.log(`✅ User created: ${user.username} (${user.email})\n`);

  // ============================================================
  // 2. CREATE EMAILS
  // ============================================================
  console.log("📧 Creating emails...");

  const primaryEmail = await prisma.email.create({
    data: {
      email: "john.doe@gmail.com",
      alias: "Personal Gmail",
      category: "primary",
      tier: "free",
      password: "encrypted_password_123",
      notes: "Main personal email for important accounts",
      userId: user.id,
    },
  });

  const secondaryEmail = await prisma.email.create({
    data: {
      email: "john.work@outlook.com",
      alias: "Work Outlook",
      category: "secondary",
      tier: "paid",
      price: 6.99,
      billingCycle: "monthly",
      password: "encrypted_password_456",
      notes: "Microsoft 365 subscription for work",
      userId: user.id,
    },
  });

  const tempEmail = await prisma.email.create({
    data: {
      email: "throwaway123@tempmail.com",
      alias: "Temp Mail",
      category: "temp",
      tier: "free",
      password: "temp_pass_789",
      notes: "For signups and trials",
      userId: user.id,
    },
  });

  console.log(`✅ Created ${3} emails\n`);

  // ============================================================
  // 3. CREATE ACCOUNTS
  // ============================================================
  console.log("🔐 Creating accounts...");

  await prisma.account.createMany({
    data: [
      {
        provider: "Netflix",
        tier: "paid",
        price: 15.99,
        dueDate: new Date("2025-01-15"),
        billingCycle: "monthly",
        authMethods: ["twofa", "authenticator"],
        username: "john.doe",
        password: "encrypted_netflix_pass",
        notes: "Premium 4K plan",
        emailId: primaryEmail.id,
        userId: user.id,
      },
      {
        provider: "Spotify",
        tier: "paid",
        price: 10.99,
        dueDate: new Date("2025-01-10"),
        billingCycle: "monthly",
        authMethods: ["none"],
        username: "johndoe_music",
        password: "encrypted_spotify_pass",
        notes: "Premium Individual",
        emailId: primaryEmail.id,
        userId: user.id,
      },
      {
        provider: "GitHub",
        tier: "free",
        authMethods: ["twofa", "passkey"],
        username: "john-doe-dev",
        password: "encrypted_github_pass",
        notes: "Free tier, using for personal projects",
        emailId: primaryEmail.id,
        userId: user.id,
      },
      {
        provider: "AWS",
        tier: "paid",
        price: 50.0,
        billingCycle: "monthly",
        authMethods: ["twofa", "authenticator"],
        username: "john.doe@company.com",
        password: "encrypted_aws_pass",
        notes: "Work AWS account",
        emailId: secondaryEmail.id,
        userId: user.id,
      },
      {
        provider: "Adobe Creative Cloud",
        tier: "paid",
        price: 54.99,
        dueDate: new Date("2025-01-20"),
        billingCycle: "monthly",
        authMethods: ["twofa"],
        username: "john.creative",
        password: "encrypted_adobe_pass",
        notes: "All Apps subscription",
        emailId: secondaryEmail.id,
        userId: user.id,
      },
      {
        provider: "Steam",
        tier: "free",
        authMethods: ["authenticator"],
        username: "gamer_john_2000",
        password: "encrypted_steam_pass",
        notes: "Gaming account",
        emailId: tempEmail.id,
        userId: user.id,
      },
      {
        provider: "Discord",
        tier: "paid",
        price: 9.99,
        billingCycle: "monthly",
        authMethods: ["twofa", "sms"],
        username: "johndoe#1234",
        password: "encrypted_discord_pass",
        notes: "Nitro subscription",
        emailId: primaryEmail.id,
        userId: user.id,
      },
      {
        provider: "LinkedIn",
        tier: "free",
        authMethods: ["twofa"],
        username: "john-doe-professional",
        password: "encrypted_linkedin_pass",
        notes: "Professional networking",
        emailId: secondaryEmail.id,
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Created ${8} accounts\n`);

  // ============================================================
  // 4. CREATE BANKS
  // ============================================================
  console.log("🏦 Creating banks...");

  const volksbank = await prisma.bank.create({
    data: {
      name: "volksbank",
      displayName: "Volksbank Checking",
      balance: 2450.75,
      lastBalanceUpdate: new Date(),
      notes: "Main checking account for daily expenses",
      userId: user.id,
    },
  });

  const sparkasse = await prisma.bank.create({
    data: {
      name: "sparkasse",
      displayName: "Sparkasse Savings",
      balance: 8500.0,
      lastBalanceUpdate: new Date(),
      notes: "Emergency fund and savings",
      userId: user.id,
    },
  });

  const volksbankVisa = await prisma.bank.create({
    data: {
      name: "volksbank_visa",
      displayName: "Volksbank VISA Card",
      balance: -350.25,
      lastBalanceUpdate: new Date(),
      notes: "Credit card for online purchases",
      userId: user.id,
    },
  });

  const paypal = await prisma.bank.create({
    data: {
      name: "paypal",
      displayName: "PayPal Balance",
      balance: 125.5,
      lastBalanceUpdate: new Date(),
      notes: "For online payments and freelance income",
      userId: user.id,
    },
  });

  console.log(`✅ Created ${4} banks\n`);

  // ============================================================
  // 5. CREATE INCOMES
  // ============================================================
  console.log("💰 Creating incomes...");

  await prisma.income.createMany({
    data: [
      {
        source: "Full-time Job - Software Developer",
        amount: 4500.0,
        cycle: "monthly",
        nextPaymentDate: new Date("2025-01-28"),
        notes: "Net salary after taxes",
        userId: user.id,
      },
      {
        source: "Freelance Web Development",
        amount: 800.0,
        cycle: "monthly",
        nextPaymentDate: new Date("2025-01-15"),
        notes: "Average monthly freelance income",
        userId: user.id,
      },
      {
        source: "Stock Dividends",
        amount: 150.0,
        cycle: "yearly",
        nextPaymentDate: new Date("2025-03-15"),
        notes: "Annual dividend payout",
        userId: user.id,
      },
      {
        source: "Side Project - SaaS",
        amount: 250.0,
        cycle: "monthly",
        nextPaymentDate: new Date("2025-01-01"),
        notes: "Monthly recurring revenue from side project",
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Created ${4} incomes\n`);

  // ============================================================
  // 6. CREATE DEBTS
  // ============================================================
  console.log("💳 Creating debts...");

  await prisma.debt.createMany({
    data: [
      {
        name: "Car Loan",
        amount: 15000.0,
        remainingAmount: 8500.0,
        payTo: "Volksbank Auto Finance",
        cycle: "monthly",
        paymentMonth: "January 2025",
        dueDate: new Date("2025-01-05"),
        monthsRemaining: 24,
        notes: "Car loan for Honda Civic 2022",
        userId: user.id,
      },
      {
        name: "Student Loan",
        amount: 25000.0,
        remainingAmount: 18750.0,
        payTo: "KfW Bank",
        cycle: "monthly",
        paymentMonth: "January 2025",
        dueDate: new Date("2025-01-20"),
        monthsRemaining: 60,
        notes: "University tuition loan",
        userId: user.id,
      },
      {
        name: "Personal Loan from Family",
        amount: 2000.0,
        remainingAmount: 500.0,
        payTo: "Uncle Hans",
        cycle: "monthly",
        paymentMonth: "January 2025",
        dueDate: new Date("2025-01-30"),
        monthsRemaining: 2,
        notes: "Loan for moving expenses - almost paid off!",
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Created ${3} debts\n`);

  // ============================================================
  // 7. CREATE CREDITS
  // ============================================================
  console.log("💳 Creating credits...");

  await prisma.credit.createMany({
    data: [
      {
        provider: "Volksbank VISA",
        totalLimit: 5000.0,
        usedAmount: 350.25,
        interestRate: 14.9,
        dueDate: new Date("2025-01-25"),
        notes: "Main credit card for online purchases",
        userId: user.id,
      },
      {
        provider: "Amazon Store Card",
        totalLimit: 2000.0,
        usedAmount: 0.0,
        interestRate: 19.9,
        dueDate: new Date("2025-01-15"),
        notes: "Only for Amazon purchases with 0% financing",
        userId: user.id,
      },
      {
        provider: "PayPal Credit",
        totalLimit: 1500.0,
        usedAmount: 250.0,
        interestRate: 21.9,
        dueDate: new Date("2025-02-01"),
        notes: "Used for some online purchases",
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Created ${3} credits\n`);

  // ============================================================
  // 8. CREATE RECURRING EXPENSES
  // ============================================================
  console.log("🔄 Creating recurring expenses...");

  await prisma.recurringExpense.createMany({
    data: [
      {
        name: "Rent",
        amount: 950.0,
        dueDate: new Date("2025-01-01"),
        cycle: "monthly",
        trialType: "none",
        category: "subscription",
        linkedBankId: volksbank.id,
        notes: "Apartment rent - 2 bedroom",
        userId: user.id,
      },
      {
        name: "Electricity",
        amount: 85.0,
        dueDate: new Date("2025-01-15"),
        cycle: "monthly",
        trialType: "none",
        category: "subscription",
        linkedBankId: volksbank.id,
        notes: "Monthly electricity bill",
        userId: user.id,
      },
      {
        name: "Internet & Phone",
        amount: 49.99,
        dueDate: new Date("2025-01-10"),
        cycle: "monthly",
        trialType: "none",
        category: "subscription",
        linkedBankId: volksbank.id,
        notes: "Fiber internet + mobile plan bundle",
        userId: user.id,
      },
      {
        name: "Car Insurance",
        amount: 1200.0,
        dueDate: new Date("2025-03-01"),
        cycle: "yearly",
        trialType: "none",
        category: "subscription",
        linkedBankId: sparkasse.id,
        notes: "Full coverage car insurance",
        userId: user.id,
      },
      {
        name: "Gym Membership",
        amount: 29.99,
        dueDate: new Date("2025-01-05"),
        cycle: "monthly",
        trialType: "none",
        category: "subscription",
        linkedBankId: volksbank.id,
        notes: "FitX gym membership",
        userId: user.id,
      },
      {
        name: "Netflix",
        amount: 15.99,
        dueDate: new Date("2025-01-15"),
        cycle: "monthly",
        trialType: "none",
        category: "subscription",
        linkedBankId: volksbankVisa.id,
        notes: "Premium 4K streaming",
        userId: user.id,
      },
      {
        name: "Spotify Premium",
        amount: 10.99,
        dueDate: new Date("2025-01-10"),
        cycle: "monthly",
        trialType: "none",
        category: "subscription",
        linkedBankId: paypal.id,
        notes: "Music streaming",
        userId: user.id,
      },
      {
        name: "iCloud Storage",
        amount: 2.99,
        dueDate: new Date("2025-01-20"),
        cycle: "monthly",
        trialType: "none",
        category: "subscription",
        linkedBankId: paypal.id,
        notes: "200GB iCloud plan",
        userId: user.id,
      },
      {
        name: "Car Loan Payment",
        amount: 354.17,
        dueDate: new Date("2025-01-05"),
        cycle: "monthly",
        trialType: "none",
        category: "debt",
        linkedBankId: volksbank.id,
        notes: "Monthly car loan payment",
        userId: user.id,
      },
      {
        name: "Student Loan Payment",
        amount: 312.5,
        dueDate: new Date("2025-01-20"),
        cycle: "monthly",
        trialType: "none",
        category: "debt",
        linkedBankId: volksbank.id,
        notes: "Monthly student loan payment",
        userId: user.id,
      },
      {
        name: "ChatGPT Plus",
        amount: 20.0,
        dueDate: new Date("2025-01-22"),
        cycle: "monthly",
        trialType: "none",
        category: "subscription",
        linkedBankId: volksbankVisa.id,
        notes: "AI assistant subscription",
        userId: user.id,
      },
      {
        name: "GitHub Copilot",
        amount: 10.0,
        dueDate: new Date("2025-01-18"),
        cycle: "monthly",
        trialType: "none",
        category: "subscription",
        linkedBankId: paypal.id,
        notes: "AI coding assistant",
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Created ${12} recurring expenses\n`);

  // ============================================================
  // 9. CREATE ONE-TIME BILLS
  // ============================================================
  console.log("📄 Creating one-time bills...");

  await prisma.oneTimeBill.createMany({
    data: [
      {
        name: "Annual Car Registration",
        amount: 180.0,
        payTo: "City Registration Office",
        dueDate: new Date("2025-02-15"),
        isPaid: false,
        linkedBankId: volksbank.id,
        notes: "Car registration renewal",
        userId: user.id,
      },
      {
        name: "Dentist Appointment",
        amount: 250.0,
        payTo: "Dr. Schmidt Dental",
        dueDate: new Date("2025-01-20"),
        isPaid: false,
        linkedBankId: volksbank.id,
        notes: "Annual dental checkup and cleaning",
        userId: user.id,
      },
      {
        name: "New Winter Tires",
        amount: 480.0,
        payTo: "Auto Plus",
        dueDate: new Date("2024-12-01"),
        isPaid: true,
        linkedBankId: volksbankVisa.id,
        notes: "Set of 4 winter tires - PAID",
        userId: user.id,
      },
      {
        name: "Flight Tickets - Summer Vacation",
        amount: 650.0,
        payTo: "Lufthansa",
        dueDate: new Date("2025-03-15"),
        isPaid: false,
        linkedBankId: volksbankVisa.id,
        notes: "Round trip to Barcelona",
        userId: user.id,
      },
      {
        name: "New Laptop Repair",
        amount: 120.0,
        payTo: "TechFix Store",
        dueDate: new Date("2025-01-08"),
        isPaid: false,
        linkedBankId: paypal.id,
        notes: "Screen replacement",
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Created ${5} one-time bills\n`);

  // ============================================================
  // 10. CREATE WISHLIST ITEMS
  // ============================================================
  console.log("🎯 Creating wishlist items...");

  await prisma.wishlistItem.createMany({
    data: [
      {
        name: "Sony WH-1000XM5 Headphones",
        price: 350.0,
        whereToBuy: "Amazon",
        needRate: "need",
        reason: "Current headphones are broken, need for work calls",
        links: [
          "https://amazon.de/dp/B09XS7JWHH",
          "https://mediamarkt.de/sony-wh1000xm5",
        ],
        imageUrl: "https://example.com/xm5.jpg",
        userId: user.id,
      },
      {
        name: "Standing Desk - IKEA BEKANT",
        price: 499.0,
        whereToBuy: "IKEA",
        needRate: "can_wait",
        reason: "Better ergonomics for home office",
        links: ["https://ikea.com/bekant-desk"],
        imageUrl: "https://example.com/bekant.jpg",
        userId: user.id,
      },
      {
        name: "PlayStation 5",
        price: 549.0,
        whereToBuy: "MediaMarkt",
        needRate: "luxury",
        reason: "Gaming on weekends",
        links: ["https://mediamarkt.de/ps5", "https://amazon.de/ps5-console"],
        imageUrl: "https://example.com/ps5.jpg",
        userId: user.id,
      },
      {
        name: "Mechanical Keyboard - Keychron K2",
        price: 89.0,
        whereToBuy: "Keychron Website",
        needRate: "can_wait",
        reason: "Better typing experience for coding",
        links: ["https://keychron.com/k2"],
        imageUrl: "https://example.com/k2.jpg",
        userId: user.id,
      },
      {
        name: '4K Monitor - LG 27" UHD',
        price: 399.0,
        whereToBuy: "Amazon",
        needRate: "need",
        reason: "Second monitor for productivity",
        links: ["https://amazon.de/lg-27uk650"],
        imageUrl: "https://example.com/lg-monitor.jpg",
        userId: user.id,
      },
      {
        name: "Apple Watch Series 9",
        price: 449.0,
        whereToBuy: "Apple Store",
        needRate: "luxury",
        reason: "Fitness tracking and notifications",
        links: ["https://apple.com/watch-series-9"],
        imageUrl: "https://example.com/apple-watch.jpg",
        userId: user.id,
      },
      {
        name: "Espresso Machine - Breville Barista Express",
        price: 599.0,
        whereToBuy: "Amazon",
        needRate: "luxury",
        reason: "Stop buying expensive coffee outside",
        links: ["https://amazon.de/breville-barista"],
        imageUrl: "https://example.com/breville.jpg",
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Created ${7} wishlist items\n`);

  // ============================================================
  // 11. CREATE NOTIFICATIONS
  // ============================================================
  console.log("🔔 Creating notifications...");

  await prisma.notification.createMany({
    data: [
      {
        type: "bill_due",
        message: "Rent payment of €950.00 is due in 3 days",
        isRead: false,
        metadata: { amount: 950, dueDate: "2025-01-01" },
        userId: user.id,
      },
      {
        type: "payment_reminder",
        message: "Car loan payment of €354.17 due on January 5th",
        isRead: false,
        metadata: { amount: 354.17, dueDate: "2025-01-05" },
        userId: user.id,
      },
      {
        type: "low_balance",
        message: "PayPal balance is below €150. Consider adding funds.",
        isRead: true,
        metadata: { balance: 125.5, threshold: 150 },
        userId: user.id,
      },
      {
        type: "success",
        message: "Successfully updated bank balances",
        isRead: true,
        userId: user.id,
      },
      {
        type: "info",
        message:
          "Welcome to Redemption! Start by adding your accounts and finances.",
        isRead: true,
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Created ${5} notifications\n`);

  // ============================================================
  // 12. CREATE SECTION TIMESTAMPS
  // ============================================================
  console.log("⏱️ Creating section timestamps...");

  const sections: Array<
    | "emails"
    | "accounts"
    | "banks"
    | "income_overview"
    | "recurring_expenses"
    | "one_time_bills"
  > = [
    "emails",
    "accounts",
    "banks",
    "income_overview",
    "recurring_expenses",
    "one_time_bills",
  ];

  await prisma.sectionTimestamp.createMany({
    data: sections.map((section) => ({
      section,
      userId: user.id,
      updatedAt: new Date(),
    })),
  });

  console.log(`✅ Created ${sections.length} section timestamps\n`);

  // ============================================================
  // 13. CREATE AUDIT LOGS
  // ============================================================
  console.log("📝 Creating audit logs...");

  await prisma.auditLog.createMany({
    data: [
      {
        action: "create",
        entity: "email",
        entityId: primaryEmail.id,
        entityName: "john.doe@gmail.com",
        changes: "",
        metadata: { source: "seed" },
        userId: user.id,
      },
      {
        action: "create",
        entity: "bank",
        entityId: volksbank.id,
        entityName: "Volksbank Checking",
        changes: "",
        metadata: { source: "seed" },
        userId: user.id,
      },
      {
        action: "update",
        entity: "bank",
        entityId: volksbank.id,
        entityName: "Volksbank Checking",
        changes: {
          balance: { old: 2000, new: 2450.75 },
        },
        metadata: { source: "seed" },
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Created ${3} audit logs\n`);

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("═".repeat(50));
  console.log("🎉 Database seeding completed successfully!\n");
  console.log("📊 Summary:");
  console.log("   • 1 User (demo / pa$$word)");
  console.log("   • 3 Emails");
  console.log("   • 8 Accounts");
  console.log("   • 4 Banks");
  console.log("   • 4 Incomes");
  console.log("   • 3 Debts");
  console.log("   • 3 Credits");
  console.log("   • 12 Recurring Expenses");
  console.log("   • 5 One-time Bills");
  console.log("   • 7 Wishlist Items");
  console.log("   • 5 Notifications");
  console.log("   • 6 Section Timestamps");
  console.log("   • 3 Audit Logs");
  console.log("═".repeat(50));
  console.log("\n🔐 Login credentials:");
  console.log("   Username: demo");
  console.log("   Password: pa$$word");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
