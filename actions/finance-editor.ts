"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { updateSectionTimestamp } from "@/actions/finance";
import type {
  PaymentCycle,
  RecurringCycle,
  TrialType,
  ExpenseCategory,
  BankName,
} from "@/types/finance";

// ============================================================
// INCOME CRUD
// ============================================================

export interface CreateIncomeInput {
  source: string;
  amount: number;
  cycle: PaymentCycle;
  nextPaymentDate?: Date | null;
  notes?: string | null;
}

export interface UpdateIncomeInput {
  id: string;
  source?: string;
  amount?: number;
  cycle?: PaymentCycle;
  nextPaymentDate?: Date | null;
  notes?: string | null;
}

export async function createIncome(
  input: CreateIncomeInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.income.create({
      data: {
        source: input.source,
        amount: input.amount,
        cycle: input.cycle,
        nextPaymentDate: input.nextPaymentDate ?? null,
        notes: input.notes ?? null,
      },
    });
    await updateSectionTimestamp("income_overview");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to create income:", error);
    return { success: false, error: "Failed to create income" };
  }
}

export async function updateIncome(
  input: UpdateIncomeInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, ...data } = input;
    await prisma.income.update({
      where: { id },
      data,
    });
    await updateSectionTimestamp("income_overview");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to update income:", error);
    return { success: false, error: "Failed to update income" };
  }
}

export async function deleteIncome(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.income.delete({
      where: { id },
    });
    await updateSectionTimestamp("income_overview");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete income:", error);
    return { success: false, error: "Failed to delete income" };
  }
}

// ============================================================
// DEBT CRUD
// ============================================================

export interface CreateDebtInput {
  name: string;
  amount: number;
  remainingAmount: number;
  payTo: string;
  cycle: PaymentCycle;
  paymentMonth?: string | null;
  dueDate?: Date | null;
  monthsRemaining?: number | null;
  notes?: string | null;
}

export interface UpdateDebtInput {
  id: string;
  name?: string;
  amount?: number;
  remainingAmount?: number;
  payTo?: string;
  cycle?: PaymentCycle;
  paymentMonth?: string | null;
  dueDate?: Date | null;
  monthsRemaining?: number | null;
  notes?: string | null;
}

export async function createDebt(
  input: CreateDebtInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.debt.create({
      data: {
        name: input.name,
        amount: input.amount,
        remainingAmount: input.remainingAmount,
        payTo: input.payTo,
        cycle: input.cycle,
        paymentMonth: input.paymentMonth ?? null,
        dueDate: input.dueDate ?? null,
        monthsRemaining: input.monthsRemaining ?? null,
        notes: input.notes ?? null,
      },
    });
    await updateSectionTimestamp("income_overview");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to create debt:", error);
    return { success: false, error: "Failed to create debt" };
  }
}

export async function updateDebt(
  input: UpdateDebtInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, ...data } = input;
    await prisma.debt.update({
      where: { id },
      data,
    });
    await updateSectionTimestamp("income_overview");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to update debt:", error);
    return { success: false, error: "Failed to update debt" };
  }
}

export async function deleteDebt(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.debt.delete({
      where: { id },
    });
    await updateSectionTimestamp("income_overview");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete debt:", error);
    return { success: false, error: "Failed to delete debt" };
  }
}

// ============================================================
// CREDIT CRUD
// ============================================================

export interface CreateCreditInput {
  provider: string;
  totalLimit: number;
  usedAmount: number;
  interestRate: number;
  dueDate?: Date | null;
  notes?: string | null;
}

export interface UpdateCreditInput {
  id: string;
  provider?: string;
  totalLimit?: number;
  usedAmount?: number;
  interestRate?: number;
  dueDate?: Date | null;
  notes?: string | null;
}

export async function createCredit(
  input: CreateCreditInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.credit.create({
      data: {
        provider: input.provider,
        totalLimit: input.totalLimit,
        usedAmount: input.usedAmount,
        interestRate: input.interestRate,
        dueDate: input.dueDate ?? null,
        notes: input.notes ?? null,
      },
    });
    await updateSectionTimestamp("income_overview");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to create credit:", error);
    return { success: false, error: "Failed to create credit" };
  }
}

export async function updateCredit(
  input: UpdateCreditInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, ...data } = input;
    await prisma.credit.update({
      where: { id },
      data,
    });
    await updateSectionTimestamp("income_overview");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to update credit:", error);
    return { success: false, error: "Failed to update credit" };
  }
}

export async function deleteCredit(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.credit.delete({
      where: { id },
    });
    await updateSectionTimestamp("income_overview");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete credit:", error);
    return { success: false, error: "Failed to delete credit" };
  }
}

// ============================================================
// RECURRING EXPENSE CRUD
// ============================================================

export interface CreateRecurringExpenseInput {
  name: string;
  amount: number;
  dueDate?: Date | null;
  cycle: RecurringCycle;
  trialType?: TrialType;
  trialEndDate?: Date | null;
  category: ExpenseCategory;
  linkedCreditId?: string | null;
  linkedDebtId?: string | null;
  linkedBankId?: string | null;
  notes?: string | null;
}

export interface UpdateRecurringExpenseInput {
  id: string;
  name?: string;
  amount?: number;
  dueDate?: Date | null;
  cycle?: RecurringCycle;
  trialType?: TrialType;
  trialEndDate?: Date | null;
  category?: ExpenseCategory;
  linkedCreditId?: string | null;
  linkedDebtId?: string | null;
  linkedBankId?: string | null;
  notes?: string | null;
}

export async function createRecurringExpense(
  input: CreateRecurringExpenseInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.recurringExpense.create({
      data: {
        name: input.name,
        amount: input.amount,
        dueDate: input.dueDate ?? null,
        cycle: input.cycle,
        trialType: input.trialType ?? "none",
        trialEndDate: input.trialEndDate ?? null,
        category: input.category,
        linkedCreditId: input.linkedCreditId ?? null,
        linkedDebtId: input.linkedDebtId ?? null,
        linkedBankId: input.linkedBankId ?? null,
        notes: input.notes ?? null,
      },
    });
    await updateSectionTimestamp("recurring_expenses");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to create recurring expense:", error);
    return { success: false, error: "Failed to create recurring expense" };
  }
}

export async function updateRecurringExpense(
  input: UpdateRecurringExpenseInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, ...data } = input;
    await prisma.recurringExpense.update({
      where: { id },
      data,
    });
    await updateSectionTimestamp("recurring_expenses");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to update recurring expense:", error);
    return { success: false, error: "Failed to update recurring expense" };
  }
}

export async function deleteRecurringExpense(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.recurringExpense.delete({
      where: { id },
    });
    await updateSectionTimestamp("recurring_expenses");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete recurring expense:", error);
    return { success: false, error: "Failed to delete recurring expense" };
  }
}

// ============================================================
// ONE-TIME BILL CRUD
// ============================================================

export interface CreateOneTimeBillInput {
  name: string;
  amount: number;
  payTo: string;
  dueDate?: Date | null;
  isPaid?: boolean;
  linkedBankId?: string | null;
  notes?: string | null;
}

export interface UpdateOneTimeBillInput {
  id: string;
  name?: string;
  amount?: number;
  payTo?: string;
  dueDate?: Date | null;
  isPaid?: boolean;
  linkedBankId?: string | null;
  notes?: string | null;
}

export async function createOneTimeBill(
  input: CreateOneTimeBillInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.oneTimeBill.create({
      data: {
        name: input.name,
        amount: input.amount,
        payTo: input.payTo,
        dueDate: input.dueDate ?? null,
        isPaid: input.isPaid ?? false,
        linkedBankId: input.linkedBankId ?? null,
        notes: input.notes ?? null,
      },
    });
    await updateSectionTimestamp("one_time_bills");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to create one-time bill:", error);
    return { success: false, error: "Failed to create one-time bill" };
  }
}

export async function updateOneTimeBill(
  input: UpdateOneTimeBillInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, ...data } = input;
    await prisma.oneTimeBill.update({
      where: { id },
      data,
    });
    await updateSectionTimestamp("one_time_bills");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to update one-time bill:", error);
    return { success: false, error: "Failed to update one-time bill" };
  }
}

export async function deleteOneTimeBill(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.oneTimeBill.delete({
      where: { id },
    });
    await updateSectionTimestamp("one_time_bills");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete one-time bill:", error);
    return { success: false, error: "Failed to delete one-time bill" };
  }
}

// ============================================================
// BANK CRUD
// ============================================================

export interface CreateBankInput {
  name: BankName;
  displayName: string;
  balance?: number;
  notes?: string | null;
}

export interface UpdateBankInput {
  id: string;
  name?: BankName;
  displayName?: string;
  balance?: number;
  notes?: string | null;
}

export async function createBank(
  input: CreateBankInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.bank.create({
      data: {
        name: input.name,
        displayName: input.displayName,
        balance: input.balance ?? 0,
        lastBalanceUpdate: new Date(),
        notes: input.notes ?? null,
      },
    });
    await updateSectionTimestamp("banks");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to create bank:", error);
    return { success: false, error: "Failed to create bank" };
  }
}

export async function updateBank(
  input: UpdateBankInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, balance, ...restData } = input;
    // If balance is being updated, also update lastBalanceUpdate
    const data =
      balance !== undefined
        ? { ...restData, balance, lastBalanceUpdate: new Date() }
        : restData;
    await prisma.bank.update({
      where: { id },
      data,
    });
    await updateSectionTimestamp("banks");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to update bank:", error);
    return { success: false, error: "Failed to update bank" };
  }
}

export async function deleteBank(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.bank.delete({
      where: { id },
    });
    await updateSectionTimestamp("banks");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete bank:", error);
    return { success: false, error: "Failed to delete bank" };
  }
}
