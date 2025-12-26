import { z } from "zod";

// ============================================================
// ENVIRONMENT SCHEMA
// ============================================================

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .url("DATABASE_URL must be a valid URL"),

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// ============================================================
// VALIDATION
// ============================================================

function validateEnv(): z.infer<typeof envSchema> {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

// ============================================================
// EXPORTS
// ============================================================

export const env = validateEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
