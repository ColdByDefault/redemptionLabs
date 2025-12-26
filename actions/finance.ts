"use server";

import { prisma } from "@/lib/prisma";
import { buildDashboardData } from "@/lib/finance";
import { notDeleted } from "@/lib/audit";
import type {
  Income,
  Debt,
  Credit,
  RecurringExpense,
  OneTimeBill,
  Bank,
  SectionName,
  SectionTimestamp,
  DashboardData,
} from "@/types/finance";

// ============================================================
// FETCH ACTIONS (excludes soft-deleted records)
// ============================================================

export async function getIncomes(): Promise<Income[]> {
  const incomes = await prisma.income.findMany({
    where: notDeleted,
    orderBy: { createdAt: "desc" },
  });
  return incomes;
}

export async function getDebts(): Promise<Debt[]> {
  const debts = await prisma.debt.findMany({
    where: notDeleted,
    orderBy: { createdAt: "desc" },
  });
  return debts;
}

export async function getCredits(): Promise<Credit[]> {
  const credits = await prisma.credit.findMany({
    where: notDeleted,
    orderBy: { createdAt: "desc" },
  });
  return credits;
}

export async function getRecurringExpenses(): Promise<RecurringExpense[]> {
  const expenses = await prisma.recurringExpense.findMany({
    where: notDeleted,
    orderBy: { createdAt: "desc" },
  });
  return expenses;
}

export async function getOneTimeBills(): Promise<OneTimeBill[]> {
  const bills = await prisma.oneTimeBill.findMany({
    where: notDeleted,
    orderBy: { dueDate: "asc" },
  });
  return bills;
}

export async function getBanks(): Promise<Bank[]> {
  const banks = await prisma.bank.findMany({
    where: notDeleted,
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

// ============================================================
// SECTION TIMESTAMPS
// ============================================================

export async function getSectionTimestamps(): Promise<
  Record<SectionName, Date | null>
> {
  const timestamps = await prisma.sectionTimestamp.findMany();

  const result: Record<SectionName, Date | null> = {
    emails: null,
    accounts: null,
    banks: null,
    income_overview: null,
    recurring_expenses: null,
    one_time_bills: null,
  };

  for (const ts of timestamps) {
    result[ts.section as SectionName] = ts.updatedAt;
  }

  return result;
}

export async function getSectionTimestamp(
  section: SectionName
): Promise<SectionTimestamp | null> {
  const timestamp = await prisma.sectionTimestamp.findUnique({
    where: { section },
  });
  return timestamp as SectionTimestamp | null;
}

export async function updateSectionTimestamp(
  section: SectionName
): Promise<void> {
  await prisma.sectionTimestamp.upsert({
    where: { section },
    update: { updatedAt: new Date() },
    create: { section, updatedAt: new Date() },
  });
}

// ============================================================
// DASHBOARD ACTION
// ============================================================

export async function getDashboardData(): Promise<DashboardData> {
  const { incomes, debts, credits, recurringExpenses, oneTimeBills, banks } =
    await getAllFinanceData();

  return buildDashboardData(
    incomes,
    debts,
    credits,
    recurringExpenses,
    oneTimeBills,
    banks
  );
}
