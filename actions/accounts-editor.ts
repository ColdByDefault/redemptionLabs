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

export async function createEmail(input: CreateEmailInput): Promise<{
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
            linkedBankId: null,
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
            linkedBankId: null,
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
    // Get the email first to find associated expenses
    const email = await prisma.email.findUnique({
      where: { id },
    });

    if (!email) {
      return { success: false, error: "Email not found" };
    }

    // Delete associated recurring expenses (auto-created from this email)
    await prisma.recurringExpense.deleteMany({
      where: {
        notes: { contains: `Auto-added from email: ${email.email}` },
      },
    });

    // Delete associated one-time bills (auto-created from this email)
    await prisma.oneTimeBill.deleteMany({
      where: {
        notes: { contains: `Auto-added from email: ${email.email}` },
      },
    });

    // Delete the email itself
    await prisma.email.delete({
      where: { id },
    });

    revalidatePath("/accounts");
    revalidatePath("/finance");
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
  authMethods?: AuthMethod[];
  username?: string | null;
  password?: string | null;
  notes?: string | null;
  emailId: string;
  linkedBankId?: string | null;
}

export interface UpdateAccountInput {
  id: string;
  provider?: string;
  tier?: AccountTier;
  price?: number | null;
  dueDate?: Date | null;
  billingCycle?: BillingCycle | null;
  authMethods?: AuthMethod[];
  username?: string | null;
  password?: string | null;
  notes?: string | null;
  emailId?: string;
  linkedBankId?: string | null;
}

export async function createAccount(input: CreateAccountInput): Promise<{
  success: boolean;
  error?: string;
  expenseAdded?: "recurring" | "onetime";
}> {
  try {
    // Validation: Check for empty provider name
    const trimmedProvider = input.provider.trim();
    if (!trimmedProvider) {
      return { success: false, error: "Provider name cannot be empty" };
    }

    // Validation: Check for duplicate provider name
    const existingAccount = await prisma.account.findUnique({
      where: { provider: trimmedProvider },
    });
    if (existingAccount) {
      return {
        success: false,
        error: `An account with provider "${trimmedProvider}" already exists`,
      };
    }

    await prisma.account.create({
      data: {
        provider: trimmedProvider,
        tier: input.tier,
        price: input.price ?? null,
        dueDate: input.dueDate ?? null,
        billingCycle: input.billingCycle ?? null,
        authMethods: input.authMethods ?? ["none"],
        username: input.username ?? null,
        password: input.password ?? null,
        notes: input.notes ?? null,
        emailId: input.emailId,
        linkedBankId: input.linkedBankId ?? null,
      },
    });

    let expenseAdded: "recurring" | "onetime" | undefined;

    // Auto-add to finance if paid account with price
    if (input.tier === "paid" && input.price && input.price > 0) {
      if (input.billingCycle === "monthly" || input.billingCycle === "yearly") {
        // Add to recurring expenses
        await prisma.recurringExpense.create({
          data: {
            name: trimmedProvider,
            amount: input.price,
            dueDate: input.dueDate ?? null,
            cycle: input.billingCycle as RecurringCycle,
            trialType: "none",
            trialEndDate: null,
            category: "subscription",
            linkedCreditId: null,
            linkedDebtId: null,
            linkedBankId: input.linkedBankId ?? null,
            notes: `Auto-added from account: ${trimmedProvider}`,
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
            name: trimmedProvider,
            amount: input.price,
            payTo: trimmedProvider,
            dueDate: input.dueDate ?? null,
            isPaid: false,
            linkedBankId: input.linkedBankId ?? null,
            notes: `Auto-added from account: ${trimmedProvider}`,
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

    // Validation: Check for empty provider name if provided
    if (data.provider !== undefined) {
      const trimmedProvider = data.provider.trim();
      if (!trimmedProvider) {
        return { success: false, error: "Provider name cannot be empty" };
      }

      // Check for duplicate provider name (excluding current account)
      const existingAccount = await prisma.account.findFirst({
        where: {
          provider: trimmedProvider,
          id: { not: id },
        },
      });
      if (existingAccount) {
        return {
          success: false,
          error: `An account with provider "${trimmedProvider}" already exists`,
        };
      }
      data.provider = trimmedProvider;
    }

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
    // Get the account first to find associated expenses
    const account = await prisma.account.findUnique({
      where: { id },
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    // Delete associated recurring expenses (auto-created from this account)
    await prisma.recurringExpense.deleteMany({
      where: {
        notes: { contains: `Auto-added from account: ${account.provider}` },
      },
    });

    // Delete associated one-time bills (auto-created from this account)
    await prisma.oneTimeBill.deleteMany({
      where: {
        notes: { contains: `Auto-added from account: ${account.provider}` },
      },
    });

    // Delete the account itself
    await prisma.account.delete({
      where: { id },
    });

    revalidatePath("/accounts");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
