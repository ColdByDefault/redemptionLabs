import { z } from "zod";

// ============================================================
// ENUM SCHEMAS
// ============================================================

export const paymentCycleSchema = z.enum([
  "monthly",
  "yearly",
  "weekly",
  "onetime",
]);

export const recurringCycleSchema = z.enum(["monthly", "yearly", "weekly"]);

export const trialTypeSchema = z.enum(["none", "week", "month", "custom"]);

export const expenseCategorySchema = z.enum(["subscription", "debt"]);

export const bankNameSchema = z.enum([
  "volksbank",
  "sparkasse",
  "volksbank_visa",
  "paypal",
]);

// ============================================================
// INCOME SCHEMAS
// ============================================================

export const createIncomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  cycle: paymentCycleSchema,
  nextPaymentDate: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateIncomeSchema = z.object({
  id: z.string().min(1, "ID is required"),
  source: z.string().min(1, "Source cannot be empty").optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0").optional(),
  cycle: paymentCycleSchema.optional(),
  nextPaymentDate: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ============================================================
// DEBT SCHEMAS
// ============================================================

export const createDebtSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  remainingAmount: z.number().min(0, "Remaining amount cannot be negative"),
  payTo: z.string().min(1, "Pay to is required"),
  cycle: paymentCycleSchema,
  paymentMonth: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  monthsRemaining: z.number().int().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateDebtSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name cannot be empty").optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0").optional(),
  remainingAmount: z
    .number()
    .min(0, "Remaining amount cannot be negative")
    .optional(),
  payTo: z.string().min(1, "Pay to cannot be empty").optional(),
  cycle: paymentCycleSchema.optional(),
  paymentMonth: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  monthsRemaining: z.number().int().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ============================================================
// CREDIT SCHEMAS
// ============================================================

export const createCreditSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  totalLimit: z.number().min(0.01, "Total limit must be greater than 0"),
  usedAmount: z.number().min(0, "Used amount cannot be negative").default(0),
  interestRate: z
    .number()
    .min(0, "Interest rate cannot be negative")
    .max(100, "Interest rate cannot exceed 100%"),
  dueDate: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateCreditSchema = z.object({
  id: z.string().min(1, "ID is required"),
  provider: z.string().min(1, "Provider cannot be empty").optional(),
  totalLimit: z
    .number()
    .min(0.01, "Total limit must be greater than 0")
    .optional(),
  usedAmount: z.number().min(0, "Used amount cannot be negative").optional(),
  interestRate: z
    .number()
    .min(0, "Interest rate cannot be negative")
    .max(100, "Interest rate cannot exceed 100%")
    .optional(),
  dueDate: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ============================================================
// RECURRING EXPENSE SCHEMAS
// ============================================================

export const createRecurringExpenseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  dueDate: z.coerce.date().nullable().optional(),
  cycle: recurringCycleSchema,
  trialType: trialTypeSchema.default("none"),
  trialEndDate: z.coerce.date().nullable().optional(),
  category: expenseCategorySchema,
  linkedCreditId: z.string().nullable().optional(),
  linkedDebtId: z.string().nullable().optional(),
  linkedBankId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateRecurringExpenseSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name cannot be empty").optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0").optional(),
  dueDate: z.coerce.date().nullable().optional(),
  cycle: recurringCycleSchema.optional(),
  trialType: trialTypeSchema.optional(),
  trialEndDate: z.coerce.date().nullable().optional(),
  category: expenseCategorySchema.optional(),
  linkedCreditId: z.string().nullable().optional(),
  linkedDebtId: z.string().nullable().optional(),
  linkedBankId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ============================================================
// ONE-TIME BILL SCHEMAS
// ============================================================

export const createOneTimeBillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  payTo: z.string().min(1, "Pay to is required"),
  dueDate: z.coerce.date().nullable().optional(),
  isPaid: z.boolean().default(false),
  linkedBankId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateOneTimeBillSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name cannot be empty").optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0").optional(),
  payTo: z.string().min(1, "Pay to cannot be empty").optional(),
  dueDate: z.coerce.date().nullable().optional(),
  isPaid: z.boolean().optional(),
  linkedBankId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ============================================================
// BANK SCHEMAS
// ============================================================

export const createBankSchema = z.object({
  name: bankNameSchema,
  displayName: z.string().min(1, "Display name is required"),
  balance: z.number().default(0),
  notes: z.string().nullable().optional(),
});

export const updateBankSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: bankNameSchema.optional(),
  displayName: z.string().min(1, "Display name cannot be empty").optional(),
  balance: z.number().optional(),
  notes: z.string().nullable().optional(),
});

// ============================================================
// GENERIC DELETE SCHEMA
// ============================================================

export const deleteByIdSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
export type CreateDebtInput = z.infer<typeof createDebtSchema>;
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;
export type CreateCreditInput = z.infer<typeof createCreditSchema>;
export type UpdateCreditInput = z.infer<typeof updateCreditSchema>;
export type CreateRecurringExpenseInput = z.infer<
  typeof createRecurringExpenseSchema
>;
export type UpdateRecurringExpenseInput = z.infer<
  typeof updateRecurringExpenseSchema
>;
export type CreateOneTimeBillInput = z.infer<typeof createOneTimeBillSchema>;
export type UpdateOneTimeBillInput = z.infer<typeof updateOneTimeBillSchema>;
export type CreateBankInput = z.infer<typeof createBankSchema>;
export type UpdateBankInput = z.infer<typeof updateBankSchema>;
