"use server";

import { auth } from "@/auth";
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
  ChartRawData,
} from "@/types/finance";

// ============================================================
// HELPER: Get authenticated user ID
// ============================================================

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
}

// ============================================================
// FETCH ACTIONS (excludes soft-deleted records)
// ============================================================

export async function getIncomes(): Promise<Income[]> {
  const userId = await getAuthenticatedUserId();
  const incomes = await prisma.income.findMany({
    where: { ...notDeleted, userId },
    orderBy: { createdAt: "desc" },
  });
  return incomes;
}

export async function getDebts(): Promise<Debt[]> {
  const userId = await getAuthenticatedUserId();
  const debts = await prisma.debt.findMany({
    where: { ...notDeleted, userId },
    orderBy: { createdAt: "desc" },
  });
  return debts;
}

export async function getCredits(): Promise<Credit[]> {
  const userId = await getAuthenticatedUserId();
  const credits = await prisma.credit.findMany({
    where: { ...notDeleted, userId },
    orderBy: { createdAt: "desc" },
  });
  return credits;
}

export async function getRecurringExpenses(): Promise<RecurringExpense[]> {
  const userId = await getAuthenticatedUserId();
  const expenses = await prisma.recurringExpense.findMany({
    where: { ...notDeleted, userId },
    orderBy: { createdAt: "desc" },
  });
  return expenses;
}

export async function getOneTimeBills(): Promise<OneTimeBill[]> {
  const userId = await getAuthenticatedUserId();
  const bills = await prisma.oneTimeBill.findMany({
    where: { ...notDeleted, userId },
    orderBy: { dueDate: "asc" },
  });
  return bills;
}

export async function getBanks(): Promise<Bank[]> {
  const userId = await getAuthenticatedUserId();
  const banks = await prisma.bank.findMany({
    where: { ...notDeleted, userId },
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
  const userId = await getAuthenticatedUserId();
  const timestamps = await prisma.sectionTimestamp.findMany({
    where: { userId },
  });

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
  const userId = await getAuthenticatedUserId();
  const timestamp = await prisma.sectionTimestamp.findUnique({
    where: { section_userId: { section, userId } },
  });
  return timestamp as SectionTimestamp | null;
}

export async function updateSectionTimestamp(
  section: SectionName
): Promise<void> {
  const userId = await getAuthenticatedUserId();
  await prisma.sectionTimestamp.upsert({
    where: { section_userId: { section, userId } },
    update: { updatedAt: new Date() },
    create: { section, userId, updatedAt: new Date() },
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

// ============================================================
// CHART DATA ACTION
// ============================================================

export async function getChartData(): Promise<ChartRawData> {
  const [incomes, recurringExpenses, banks] = await Promise.all([
    getIncomes(),
    getRecurringExpenses(),
    getBanks(),
  ]);

  return {
    incomes,
    recurringExpenses,
    banks,
  };
}
