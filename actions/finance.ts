"use server";

import { prisma } from "@/lib/prisma";
import type {
  Income,
  Debt,
  Credit,
  RecurringExpense,
  OneTimeBill,
  Bank,
} from "@/types/finance";

// ============================================================
// FETCH ACTIONS
// ============================================================

export async function getIncomes(): Promise<Income[]> {
  const incomes = await prisma.income.findMany({
    orderBy: { createdAt: "desc" },
  });
  return incomes;
}

export async function getDebts(): Promise<Debt[]> {
  const debts = await prisma.debt.findMany({
    orderBy: { createdAt: "desc" },
  });
  return debts;
}

export async function getCredits(): Promise<Credit[]> {
  const credits = await prisma.credit.findMany({
    orderBy: { createdAt: "desc" },
  });
  return credits;
}

export async function getRecurringExpenses(): Promise<RecurringExpense[]> {
  const expenses = await prisma.recurringExpense.findMany({
    orderBy: { createdAt: "desc" },
  });
  return expenses;
}

export async function getOneTimeBills(): Promise<OneTimeBill[]> {
  const bills = await prisma.oneTimeBill.findMany({
    orderBy: { dueDate: "asc" },
  });
  return bills;
}

export async function getBanks(): Promise<Bank[]> {
  const banks = await prisma.bank.findMany({
    orderBy: { name: "asc" },
  });
  return banks;
}

// ============================================================
// FETCH ALL FINANCE DATA
// ============================================================

export interface FinanceData {
  incomes: Income[];
  debts: Debt[];
  credits: Credit[];
  recurringExpenses: RecurringExpense[];
  oneTimeBills: OneTimeBill[];
  banks: Bank[];
}

export async function getAllFinanceData(): Promise<FinanceData> {
  const [incomes, debts, credits, recurringExpenses, oneTimeBills, banks] =
    await Promise.all([
      getIncomes(),
      getDebts(),
      getCredits(),
      getRecurringExpenses(),
      getOneTimeBills(),
      getBanks(),
    ]);

  return {
    incomes,
    debts,
    credits,
    recurringExpenses,
    oneTimeBills,
    banks,
  };
}
