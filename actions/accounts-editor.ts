"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type {
  EmailCategory,
  EmailAlias,
  AccountTier,
  BillingCycle,
  AuthMethod,
} from "@/types/account";

// ============================================================
// EMAIL CRUD
// ============================================================

export interface CreateEmailInput {
  email: string;
  alias?: EmailAlias | null;
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
  alias?: EmailAlias | null;
  category?: EmailCategory;
  tier?: AccountTier;
  price?: number | null;
  billingCycle?: BillingCycle | null;
  password?: string;
  notes?: string | null;
}

export async function createEmail(
  input: CreateEmailInput
): Promise<{ success: boolean; error?: string }> {
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
    revalidatePath("/accounts");
    return { success: true };
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
): Promise<{ success: boolean; error?: string }> {
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
    revalidatePath("/accounts");
    return { success: true };
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
