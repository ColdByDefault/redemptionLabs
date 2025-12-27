import { z } from "zod";

// ============================================================
// ENUM SCHEMAS
// ============================================================

export const emailCategorySchema = z.enum(["primary", "secondary", "temp"]);

export const accountTierSchema = z.enum(["free", "paid"]);

export const billingCycleSchema = z.enum([
  "monthly",
  "yearly",
  "lifetime",
  "onetime",
]);

export const authMethodSchema = z.enum([
  "none",
  "twofa",
  "passkey",
  "sms",
  "authenticator",
  "other",
]);

// ============================================================
// EMAIL SCHEMAS
// ============================================================

export const createEmailSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Must be a valid email address"),
    alias: z.string().nullable().optional(),
    category: emailCategorySchema,
    tier: accountTierSchema,
    price: z.number().min(0, "Price must be positive").nullable().optional(),
    billingCycle: billingCycleSchema.nullable().optional(),
    password: z.string().min(1, "Password is required"),
    notes: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // If tier is paid, price and billingCycle should be provided
      if (data.tier === "paid") {
        return (
          data.price !== null && data.price !== undefined && data.price > 0
        );
      }
      return true;
    },
    {
      message: "Paid tier requires a price greater than 0",
      path: ["price"],
    }
  );

export const updateEmailSchema = z.object({
  id: z.string().min(1, "ID is required"),
  email: z.string().email("Must be a valid email address").optional(),
  alias: z.string().nullable().optional(),
  category: emailCategorySchema.optional(),
  tier: accountTierSchema.optional(),
  price: z.number().min(0, "Price must be positive").nullable().optional(),
  billingCycle: billingCycleSchema.nullable().optional(),
  password: z.string().min(1, "Password cannot be empty").optional(),
  notes: z.string().nullable().optional(),
});

export const deleteEmailSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// ============================================================
// ACCOUNT SCHEMAS
// ============================================================

export const createAccountSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  tier: accountTierSchema,
  price: z.number().min(0, "Price must be positive").nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  billingCycle: billingCycleSchema.nullable().optional(),
  authMethods: z.array(authMethodSchema).default(["none"]),
  username: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  emailId: z.string().min(1, "Email is required"),
  linkedBankId: z.string().nullable().optional(),
});

export const updateAccountSchema = z.object({
  id: z.string().min(1, "ID is required"),
  provider: z.string().min(1, "Provider cannot be empty").optional(),
  tier: accountTierSchema.optional(),
  price: z.number().min(0, "Price must be positive").nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  billingCycle: billingCycleSchema.nullable().optional(),
  authMethods: z.array(authMethodSchema).optional(),
  username: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  emailId: z.string().min(1, "Email cannot be empty").optional(),
  linkedBankId: z.string().nullable().optional(),
});

export const deleteAccountSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateEmailInput = z.infer<typeof createEmailSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
