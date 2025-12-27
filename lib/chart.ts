import type {
  RecurringExpense,
  Income,
  Bank,
  ExpenseCategory,
} from "@/types/finance";
import type {
  ExpenseBreakdownItem,
  ExpenseBreakdownData,
  MonthlyFinancePoint,
  IncomeVsExpensesData,
  BankBalancePoint,
  BankBalanceHistoryData,
} from "@/types/chart";
import { formatBankName, calculateTotalIncome } from "@/lib/finance";

// ============================================================
// COLOR CONSTANTS
// ============================================================

export const CHART_COLORS = {
  // Primary palette for pie chart
  pie: [
    "#3b82f6", // blue-500
    "#ef4444", // red-500
    "#22c55e", // green-500
    "#f59e0b", // amber-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#14b8a6", // teal-500
    "#f97316", // orange-500
    "#6366f1", // indigo-500
    "#84cc16", // lime-500
  ],
  // Category specific colors
  category: {
    subscription: "#22c55e", // green-500
    debt: "#ef4444", // red-500
  } as Record<ExpenseCategory, string>,
  // Line chart colors
  income: "#22c55e", // green-500
  expenses: "#ef4444", // red-500
  net: "#3b82f6", // blue-500
  balance: "#8b5cf6", // violet-500
  // Bank specific colors
  bank: {
    volksbank: "#ea580c", // orange-600
    sparkasse: "#dc2626", // red-600
    volksbank_visa: "#2563eb", // blue-600
    paypal: "#4f46e5", // indigo-600
  } as Record<string, string>,
} as const;

// ============================================================
// EXPENSE BREAKDOWN HELPERS
// ============================================================

export function buildExpenseBreakdownByCategory(
  expenses: RecurringExpense[]
): ExpenseBreakdownData {
  const categoryTotals: Record<ExpenseCategory, number> = {
    subscription: 0,
    debt: 0,
  };

  for (const expense of expenses) {
    categoryTotals[expense.category] += expense.amount;
  }

  const total = Object.values(categoryTotals).reduce(
    (sum, val) => sum + val,
    0
  );

  const items: ExpenseBreakdownItem[] = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      name: category === "subscription" ? "Subscriptions" : "Debts",
      value,
      color: CHART_COLORS.category[category as ExpenseCategory],
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));

  return { items, total };
}

export function buildExpenseBreakdownByName(
  expenses: RecurringExpense[]
): ExpenseBreakdownData {
  const expenseMap = new Map<string, number>();

  for (const expense of expenses) {
    const current = expenseMap.get(expense.name) ?? 0;
    expenseMap.set(expense.name, current + expense.amount);
  }

  const total = Array.from(expenseMap.values()).reduce(
    (sum, val) => sum + val,
    0
  );

  const items: ExpenseBreakdownItem[] = Array.from(expenseMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS.pie[index % CHART_COLORS.pie.length] ?? "#6b7280",
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));

  return { items, total };
}

// ============================================================
// INCOME VS EXPENSES HELPERS
// ============================================================

export function buildIncomeVsExpensesData(
  incomes: Income[],
  expenses: RecurringExpense[],
  monthsBack: number = 6
): IncomeVsExpensesData {
  const points: MonthlyFinancePoint[] = [];
  const now = new Date();

  // Calculate monthly totals (simplified - assumes monthly cycle)
  const monthlyIncome = calculateTotalIncome(incomes);
  const monthlyExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });

    // For now, use current monthly values (in real app, this would come from historical data)
    // Add slight variation for demo purposes
    const variation = 1 + (Math.random() - 0.5) * 0.1;
    const income = i === 0 ? monthlyIncome : monthlyIncome * variation;
    const expenseAmount =
      i === 0 ? monthlyExpenses : monthlyExpenses * variation;

    points.push({
      month,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenseAmount * 100) / 100,
      net: Math.round((income - expenseAmount) * 100) / 100,
    });
  }

  const averageIncome =
    points.reduce((sum, p) => sum + p.income, 0) / points.length;
  const averageExpenses =
    points.reduce((sum, p) => sum + p.expenses, 0) / points.length;

  return {
    points,
    averageIncome: Math.round(averageIncome * 100) / 100,
    averageExpenses: Math.round(averageExpenses * 100) / 100,
  };
}

// ============================================================
// BANK BALANCE HISTORY HELPERS
// ============================================================

export function buildBankBalanceHistory(
  banks: Bank[],
  daysBack: number = 30
): BankBalanceHistoryData {
  const points: BankBalancePoint[] = [];
  const now = new Date();
  const currentTotal = banks.reduce((sum, bank) => sum + bank.balance, 0);

  // Generate historical points (simulated for now)
  // In real app, this would come from a balance history table
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Simulate slight daily variations
    const variation = 1 + (Math.random() - 0.5) * 0.05;
    const balance = i === 0 ? currentTotal : currentTotal * variation;

    points.push({
      date: dateStr,
      balance: Math.round(balance * 100) / 100,
      bankName: "Total",
    });
  }

  const balances = points.map((p) => p.balance);

  return {
    points,
    currentBalance: currentTotal,
    lowestBalance: Math.min(...balances),
    highestBalance: Math.max(...balances),
  };
}

export function buildBankBalanceByBank(banks: Bank[]): ExpenseBreakdownData {
  const total = banks.reduce((sum, bank) => sum + bank.balance, 0);

  const items: ExpenseBreakdownItem[] = banks
    .filter((bank) => bank.balance !== 0)
    .map((bank) => ({
      name: formatBankName(bank.name),
      value: bank.balance,
      color: CHART_COLORS.bank[bank.name] ?? "#6b7280",
      percentage: total > 0 ? (bank.balance / total) * 100 : 0,
    }));

  return { items, total };
}

// ============================================================
// FORMATTING HELPERS
// ============================================================

export function formatChartCurrency(value: number): string {
  return `€${value.toFixed(0)}`;
}

export function formatChartPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
