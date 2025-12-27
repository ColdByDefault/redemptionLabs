import path from "node:path";
import type { PrismaConfig } from "prisma";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

type PrismaConfigExtended = PrismaConfig & {
  migrate: {
    url: () => Promise<string>;
  };
};

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  datasource: {
    url: process.env.DATABASE_URL!,
  },

  migrate: {
    async url() {
      return process.env.DATABASE_URL!;
    },
  },
} as PrismaConfigExtended);
