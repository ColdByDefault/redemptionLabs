// Types for Finance models
// Mirrors Prisma schema enums and models

// ============================================================
// ENUMS
// ============================================================

export type PaymentCycle = "monthly" | "yearly" | "weekly" | "onetime";

export type RecurringCycle = "monthly" | "yearly" | "weekly";

export type TrialType = "none" | "week" | "month" | "custom";

export type ExpenseCategory = "subscription" | "debt";

export type BankName = "volksbank" | "sparkasse" | "volksbank_visa" | "paypal";

// ============================================================
// INCOME TYPES
// ============================================================

export interface Income {
  id: string;
  source: string;
  amount: number;
  cycle: PaymentCycle;
  nextPaymentDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ============================================================
// DEBT & CREDIT TYPES
// ============================================================

export interface Debt {
  id: string;
  name: string;
  amount: number;
  remainingAmount: number;
  payTo: string;
  cycle: PaymentCycle;
  paymentMonth: string | null;
  dueDate: Date | null;
  monthsRemaining: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Credit {
  id: string;
  provider: string;
  totalLimit: number;
  usedAmount: number;
  interestRate: number;
  dueDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ============================================================
// RECURRING EXPENSE TYPES
// ============================================================

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | null;
  cycle: RecurringCycle;
  trialType: TrialType;
  trialEndDate: Date | null;
  category: ExpenseCategory;
  linkedCreditId: string | null;
  linkedDebtId: string | null;
  linkedBankId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ============================================================
// ONE-TIME BILL TYPES
// ============================================================

export interface OneTimeBill {
  id: string;
  name: string;
  amount: number;
  payTo: string;
  dueDate: Date | null;
  isPaid: boolean;
  linkedBankId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ============================================================
// BANK TYPES
// ============================================================

export interface Bank {
  id: string;
  name: BankName;
  displayName: string;
  balance: number;
  lastBalanceUpdate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ============================================================
// SUMMARY TYPES
// ============================================================

export interface FinanceSummary {
  totalIncome: number;
  totalExpensesWithoutDebts: number;
  totalExpensesWithDebts: number;
  totalDebts: number;
  totalCredits: number;
  totalBankBalance: number;
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface UpcomingBill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  type: "recurring" | "onetime";
  daysUntilDue: number;
}

export interface BankBalanceSummary {
  name: BankName;
  displayName: string;
  balance: number;
}

export interface DashboardData {
  summary: FinanceSummary;
  upcomingBills: UpcomingBill[];
  bankBalances: BankBalanceSummary[];
  monthlyNetIncome: number;
}

// ============================================================
// CHART DATA TYPES (for dashboard visualizations)
// ============================================================

export interface ChartRawData {
  incomes: Income[];
  recurringExpenses: RecurringExpense[];
  banks: Bank[];
}

// ============================================================
// SECTION TIMESTAMP TYPES
// ============================================================

export type SectionName =
  | "emails"
  | "accounts"
  | "banks"
  | "income_overview"
  | "recurring_expenses"
  | "one_time_bills";

export interface SectionTimestamp {
  id: string;
  section: SectionName;
  updatedAt: Date;
}
