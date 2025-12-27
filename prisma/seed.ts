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
      email: "",
      category: "",
      tier: "",
      password: "",
      notes: null,
    },
  });
  };
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
