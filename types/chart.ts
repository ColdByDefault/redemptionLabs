// Types for Chart data structures
// Used by recharts components for visualization

// ============================================================
// EXPENSE BREAKDOWN (PIE CHART)
// ============================================================

export interface ExpenseBreakdownItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface ExpenseBreakdownData {
  items: ExpenseBreakdownItem[];
  total: number;
}

// ============================================================
// INCOME VS EXPENSES (LINE CHART)
// ============================================================

export interface MonthlyFinancePoint {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface IncomeVsExpensesData {
  points: MonthlyFinancePoint[];
  averageIncome: number;
  averageExpenses: number;
}

// ============================================================
// BANK BALANCE HISTORY (AREA/LINE CHART)
// ============================================================

export interface BankBalancePoint {
  date: string;
  balance: number;
  bankName: string;
}

export interface BankBalanceHistoryData {
  points: BankBalancePoint[];
  currentBalance: number;
  lowestBalance: number;
  highestBalance: number;
}

// ============================================================
// CHART CONFIGURATION
// ============================================================

export type ChartColorScheme = "default" | "expense" | "income" | "balance";

export interface ChartConfig {
  colorScheme: ChartColorScheme;
  showLegend: boolean;
  showTooltip: boolean;
  animate: boolean;
}
