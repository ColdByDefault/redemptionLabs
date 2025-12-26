"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type {
  EmailCategory,
  AccountTier,
  BillingCycle,
  AuthMethod,
} from "@/types/account";
import type { RecurringCycle } from "@/types/finance";

// ============================================================
// EMAIL CRUD
// ============================================================

export interface CreateEmailInput {
  email: string;
  alias?: string | null;
  category: EmailCategory;
  tier: AccountTier;
  price?: number | null;
  billingCycle?: BillingCycle | null;
  password: string;
  notes?: string | null;
}

export interface UpdateEmailInput {
  id: string;
  email?: string;
  alias?: string | null;
  category?: EmailCategory;
  tier?: AccountTier;
  price?: number | null;
  billingCycle?: BillingCycle | null;
  password?: string;
  notes?: string | null;
}

export async function createEmail(
  input: CreateEmailInput
): Promise<{
  success: boolean;
  error?: string;
  expenseAdded?: "recurring" | "onetime";
}> {
  try {
    await prisma.email.create({
      data: {
        email: input.email,
        alias: input.alias ?? null,
        category: input.category,
        tier: input.tier,
        price: input.price ?? null,
        billingCycle: input.billingCycle ?? null,
        password: input.password,
        notes: input.notes ?? null,
      },
    });

    let expenseAdded: "recurring" | "onetime" | undefined;

    // Auto-add to finance if paid email with price
    if (input.tier === "paid" && input.price && input.price > 0) {
      const emailName = input.alias || input.email;

      if (input.billingCycle === "monthly" || input.billingCycle === "yearly") {
        // Add to recurring expenses
        await prisma.recurringExpense.create({
          data: {
            name: `Email: ${emailName}`,
            amount: input.price,
            dueDate: null,
            cycle: input.billingCycle as RecurringCycle,
            trialType: "none",
            trialEndDate: null,
            category: "subscription",
            linkedCreditId: null,
            linkedDebtId: null,
            notes: `Auto-added from email: ${input.email}`,
          },
        });
        expenseAdded = "recurring";
      } else if (
        input.billingCycle === "onetime" ||
        input.billingCycle === "lifetime"
      ) {
        // Add to one-time bills
        await prisma.oneTimeBill.create({
          data: {
            name: `Email: ${emailName}`,
            amount: input.price,
            payTo: "Email Provider",
            dueDate: null,
            isPaid: false,
            notes: `Auto-added from email: ${input.email}`,
          },
        });
        expenseAdded = "onetime";
      }

      if (expenseAdded) {
        revalidatePath("/finance");
      }
    }

    revalidatePath("/accounts");
    return { success: true, expenseAdded };
  } catch (error) {
    console.error("Failed to create email:", error);
    return { success: false, error: "Failed to create email" };
  }
}

export async function updateEmail(
  input: UpdateEmailInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, ...data } = input;
    await prisma.email.update({
      where: { id },
      data,
    });
    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.error("Failed to update email:", error);
    return { success: false, error: "Failed to update email" };
  }
}

export async function deleteEmail(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.email.delete({
      where: { id },
    });
    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete email:", error);
    return { success: false, error: "Failed to delete email" };
  }
}

// ============================================================
// ACCOUNT (SUBSCRIPTION) CRUD
// ============================================================

export interface CreateAccountInput {
  provider: string;
  tier: AccountTier;
  price?: number | null;
  dueDate?: Date | null;
  billingCycle?: BillingCycle | null;
  authMethod?: AuthMethod;
  username?: string | null;
  password?: string | null;
  notes?: string | null;
  emailId: string;
}

export interface UpdateAccountInput {
  id: string;
  provider?: string;
  tier?: AccountTier;
  price?: number | null;
  dueDate?: Date | null;
  billingCycle?: BillingCycle | null;
  authMethod?: AuthMethod;
  username?: string | null;
  password?: string | null;
  notes?: string | null;
  emailId?: string;
}

export async function createAccount(
  input: CreateAccountInput
): Promise<{
  success: boolean;
  error?: string;
  expenseAdded?: "recurring" | "onetime";
}> {
  try {
    await prisma.account.create({
      data: {
        provider: input.provider,
        tier: input.tier,
        price: input.price ?? null,
        dueDate: input.dueDate ?? null,
        billingCycle: input.billingCycle ?? null,
        authMethod: input.authMethod ?? "none",
        username: input.username ?? null,
        password: input.password ?? null,
        notes: input.notes ?? null,
        emailId: input.emailId,
      },
    });

    let expenseAdded: "recurring" | "onetime" | undefined;

    // Auto-add to finance if paid account with price
    if (input.tier === "paid" && input.price && input.price > 0) {
      if (input.billingCycle === "monthly" || input.billingCycle === "yearly") {
        // Add to recurring expenses
        await prisma.recurringExpense.create({
          data: {
            name: input.provider,
            amount: input.price,
            dueDate: input.dueDate ?? null,
            cycle: input.billingCycle as RecurringCycle,
            trialType: "none",
            trialEndDate: null,
            category: "subscription",
            linkedCreditId: null,
            linkedDebtId: null,
            notes: `Auto-added from account: ${input.provider}`,
          },
        });
        expenseAdded = "recurring";
      } else if (
        input.billingCycle === "onetime" ||
        input.billingCycle === "lifetime"
      ) {
        // Add to one-time bills
        await prisma.oneTimeBill.create({
          data: {
            name: input.provider,
            amount: input.price,
            payTo: input.provider,
            dueDate: input.dueDate ?? null,
            isPaid: false,
            notes: `Auto-added from account: ${input.provider}`,
          },
        });
        expenseAdded = "onetime";
      }

      if (expenseAdded) {
        revalidatePath("/finance");
      }
    }

    revalidatePath("/accounts");
    return { success: true, expenseAdded };
  } catch (error) {
    console.error("Failed to create account:", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function updateAccount(
  input: UpdateAccountInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, ...data } = input;
    await prisma.account.update({
      where: { id },
      data,
    });
    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.error("Failed to update account:", error);
    return { success: false, error: "Failed to update account" };
  }
}

export async function deleteAccount(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.account.delete({
      where: { id },
    });
    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
