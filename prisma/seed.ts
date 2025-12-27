import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  // Clear existing data
  await prisma.account.deleteMany();
  await prisma.email.deleteMany();

  // Create emails
  const mainEmail = await prisma.email.create({
    data: {
      email: "abo.ayash.yazan@gmail.com",
      category: "primary",
      tier: "free",
      password: "",
      notes: null,
    },
  });

  await prisma.email.create({
    data: {
      email: "stonylonesome7@icloud.com",
      category: "secondary",
      tier: "paid",
      price: 0.99,
      billingCycle: "monthly",
      password: "",
      notes: null,
    },
  });

  await prisma.email.create({
    data: {
      email: "yazan.abo-ayash@avarno.de",
      category: "secondary",
      tier: "free",
      password: "",
      notes: "ends soon",
    },
  });

  await prisma.email.create({
    data: {
      email: "yazan.abo-ayash@education.gfn",
      category: "secondary",
      tier: "free",
      password: "",
      notes: "ends soon",
    },
  });

  // Create accounts linked to main gmail
  await prisma.account.create({
    data: {
      provider: "Spotify",
      tier: "paid",
      price: 17.5,
      billingCycle: "monthly",
      authMethods: ["none"],
      emailId: mainEmail.id,
    },
  });

  await prisma.account.create({
    data: {
      provider: "GitHub",
      tier: "free",
      authMethods: ["none"],
      emailId: mainEmail.id,
    },
  });

  await prisma.account.create({
    data: {
      provider: "GitHub Copilot",
      tier: "paid",
      price: 35,
      billingCycle: "monthly",
      authMethods: ["none"],
      emailId: mainEmail.id,
    },
  });

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
