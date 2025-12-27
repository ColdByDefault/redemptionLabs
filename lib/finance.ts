import type {
  PaymentCycle,
  RecurringCycle,
  TrialType,
  ExpenseCategory,
  BankName,
  Income,
  Debt,
  Credit,
  RecurringExpense,
  OneTimeBill,
  Bank,
  FinanceSummary,
  UpcomingBill,
  BankBalanceSummary,
  DashboardData,
} from "@/types/finance";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// ============================================================
// PAYMENT CYCLE HELPERS
// ============================================================

export function getPaymentCycleColor(cycle: PaymentCycle): string {
  const colors: Record<PaymentCycle, string> = {
    monthly: "bg-blue-500 text-white border-blue-500",
    yearly: "bg-purple-500 text-white border-purple-500",
    weekly: "bg-cyan-500 text-white border-cyan-500",
    onetime: "bg-gray-500 text-white border-gray-500",
  };
  return colors[cycle];
}

export function getPaymentCycleVariant(cycle: PaymentCycle): BadgeVariant {
  const variants: Record<PaymentCycle, BadgeVariant> = {
    monthly: "secondary",
    yearly: "default",
    weekly: "secondary",
    onetime: "outline",
  };
  return variants[cycle];
}

export function formatPaymentCycle(cycle: PaymentCycle): string {
  const labels: Record<PaymentCycle, string> = {
    monthly: "Monthly",
    yearly: "Yearly",
    weekly: "Weekly",
    onetime: "One-time",
  };
  return labels[cycle];
}

// ============================================================
// RECURRING CYCLE HELPERS
// ============================================================

export function getRecurringCycleColor(cycle: RecurringCycle): string {
  const colors: Record<RecurringCycle, string> = {
    monthly: "bg-blue-500 text-white border-blue-500",
    yearly: "bg-purple-500 text-white border-purple-500",
    weekly: "bg-cyan-500 text-white border-cyan-500",
  };
  return colors[cycle];
}

export function formatRecurringCycle(cycle: RecurringCycle): string {
  const labels: Record<RecurringCycle, string> = {
    monthly: "Monthly",
    yearly: "Yearly",
    weekly: "Weekly",
  };
  return labels[cycle];
}

// ============================================================
// TRIAL TYPE HELPERS
// ============================================================

export function getTrialTypeColor(trialType: TrialType): string {
  const colors: Record<TrialType, string> = {
    none: "bg-gray-500 text-white border-gray-500",
    week: "bg-orange-500 text-white border-orange-500",
    month: "bg-amber-500 text-white border-amber-500",
    custom: "bg-yellow-500 text-white border-yellow-500",
  };
  return colors[trialType];
}

export function getTrialTypeVariant(trialType: TrialType): BadgeVariant {
  const variants: Record<TrialType, BadgeVariant> = {
    none: "outline",
    week: "secondary",
    month: "default",
    custom: "secondary",
  };
  return variants[trialType];
}

export function formatTrialType(trialType: TrialType): string {
  const labels: Record<TrialType, string> = {
    none: "No Trial",
    week: "7-Day Trial",
    month: "30-Day Trial",
    custom: "Custom Trial",
  };
  return labels[trialType];
}

// ============================================================
// EXPENSE CATEGORY HELPERS
// ============================================================

export function getExpenseCategoryColor(category: ExpenseCategory): string {
  const colors: Record<ExpenseCategory, string> = {
    subscription: "bg-green-500 text-white border-green-500",
    debt: "bg-red-500 text-white border-red-500",
  };
  return colors[category];
}

export function getExpenseCategoryVariant(
  category: ExpenseCategory
): BadgeVariant {
  const variants: Record<ExpenseCategory, BadgeVariant> = {
    subscription: "default",
    debt: "destructive",
  };
  return variants[category];
}

export function formatExpenseCategory(category: ExpenseCategory): string {
  const labels: Record<ExpenseCategory, string> = {
    subscription: "Subscription",
    debt: "Debt",
  };
  return labels[category];
}

// ============================================================
// BANK NAME HELPERS
// ============================================================

export function getBankNameColor(name: BankName): string {
  const colors: Record<BankName, string> = {
    volksbank: "bg-orange-600 text-white border-orange-600",
    sparkasse: "bg-red-600 text-white border-red-600",
    volksbank_visa: "bg-blue-600 text-white border-blue-600",
    paypal: "bg-indigo-600 text-white border-indigo-600",
  };
  return colors[name];
}

export function formatBankName(name: BankName): string {
  const labels: Record<BankName, string> = {
    volksbank: "Volksbank",
    sparkasse: "Sparkasse",
    volksbank_visa: "Volksbank Visa",
    paypal: "PayPal",
  };
  return labels[name];
}

// ============================================================
// FORMATTING HELPERS
// ============================================================

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "-";
  return `€${amount.toFixed(2)}`;
}

export function formatPercentage(rate: number | null | undefined): string {
  if (rate == null) return "-";
  return `${rate.toFixed(2)}%`;
}

export function formatFinanceDate(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatMonthsRemaining(months: number | null): string {
  if (months == null) return "-";
  if (months === 1) return "1 month";
  return `${months} months`;
}

// ============================================================
// PAID STATUS HELPERS
// ============================================================

export function getPaidStatusColor(isPaid: boolean): string {
  return isPaid
    ? "bg-green-500 text-white border-green-500"
    : "bg-red-500 text-white border-red-500";
}

export function getPaidStatusVariant(isPaid: boolean): BadgeVariant {
  return isPaid ? "default" : "destructive";
}

export function formatPaidStatus(isPaid: boolean): string {
  return isPaid ? "Paid" : "Unpaid";
}

// ============================================================
// CALCULATION HELPERS
// ============================================================

export function calculateTotalIncome(incomes: Income[]): number {
  return incomes.reduce((sum, income) => sum + income.amount, 0);
}

export function calculateTotalDebts(debts: Debt[]): number {
  return debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
}

export function calculateTotalCredits(credits: Credit[]): number {
  return credits.reduce((sum, credit) => sum + credit.usedAmount, 0);
}

export function calculateTotalCreditAvailable(credits: Credit[]): number {
  return credits.reduce(
    (sum, credit) => sum + (credit.totalLimit - credit.usedAmount),
    0
  );
}

export function calculateTotalCreditLimit(credits: Credit[]): number {
  return credits.reduce((sum, credit) => sum + credit.totalLimit, 0);
}

export function calculateTotalRecurringExpenses(
  expenses: RecurringExpense[]
): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function calculateTotalRecurringExpensesWithoutDebts(
  expenses: RecurringExpense[]
): number {
  return expenses
    .filter((expense) => expense.category === "subscription")
    .reduce((sum, expense) => sum + expense.amount, 0);
}

export function calculateTotalOneTimeBills(bills: OneTimeBill[]): number {
  return bills
    .filter((bill) => !bill.isPaid)
    .reduce((sum, bill) => sum + bill.amount, 0);
}

export function calculateTotalBankBalance(banks: Bank[]): number {
  return banks.reduce((sum, bank) => sum + bank.balance, 0);
}

export function calculateFinanceSummary(
  incomes: Income[],
  debts: Debt[],
  credits: Credit[],
  recurringExpenses: RecurringExpense[],
  banks: Bank[]
): FinanceSummary {
  const totalIncome = calculateTotalIncome(incomes);
  const totalDebts = calculateTotalDebts(debts);
  const totalCredits = calculateTotalCredits(credits);
  const totalExpensesWithoutDebts =
    calculateTotalRecurringExpensesWithoutDebts(recurringExpenses);
  const totalExpensesWithDebts =
    calculateTotalRecurringExpenses(recurringExpenses);
  const totalBankBalance = calculateTotalBankBalance(banks);

  return {
    totalIncome,
    totalExpensesWithoutDebts,
    totalExpensesWithDebts,
    totalDebts,
    totalCredits,
    totalBankBalance,
  };
}

// ============================================================
// DATE HELPERS
// ============================================================

export function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const parts = d.toISOString().split("T");
  return parts[0] ?? "";
}

export function isTrialExpiring(
  trialType: TrialType,
  trialEndDate: Date | null
): boolean {
  if (trialType === "none" || !trialEndDate) return false;
  const now = new Date();
  const endDate = new Date(trialEndDate);
  const diffDays = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays <= 3 && diffDays >= 0;
}

export function isOverdue(dueDate: Date | null): boolean {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  return due < now;
}

export function formatRelativeTime(date: Date | null | undefined): string {
  if (!date) return "-";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatFinanceDate(date);
}

// ============================================================
// DASHBOARD HELPERS
// ============================================================

/**
 * Get upcoming bills within the specified number of days
 */
export function getUpcomingBills(
  recurringExpenses: RecurringExpense[],
  oneTimeBills: OneTimeBill[],
  withinDays: number = 7
): UpcomingBill[] {
  const now = new Date();
  const upcoming: UpcomingBill[] = [];

  // Add recurring expenses with due dates within range
  for (const expense of recurringExpenses) {
    if (!expense.dueDate) continue;
    const due = new Date(expense.dueDate);
    const diffMs = due.getTime() - now.getTime();
    const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysUntilDue >= 0 && daysUntilDue <= withinDays) {
      upcoming.push({
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        dueDate: due,
        type: "recurring",
        daysUntilDue,
      });
    }
  }

  // Add unpaid one-time bills with due dates within range
  for (const bill of oneTimeBills) {
    if (!bill.dueDate || bill.isPaid) continue;
    const due = new Date(bill.dueDate);
    const diffMs = due.getTime() - now.getTime();
    const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysUntilDue >= 0 && daysUntilDue <= withinDays) {
      upcoming.push({
        id: bill.id,
        name: bill.name,
        amount: bill.amount,
        dueDate: due,
        type: "onetime",
        daysUntilDue,
      });
    }
  }

  // Sort by days until due (soonest first)
  return upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

/**
 * Get bank balance summaries
 */
export function getBankBalanceSummaries(banks: Bank[]): BankBalanceSummary[] {
  return banks.map((bank) => ({
    name: bank.name,
    displayName: bank.displayName,
    balance: bank.balance,
  }));
}

/**
 * Calculate monthly net income (income - expenses)
 */
export function calculateMonthlyNetIncome(
  incomes: Income[],
  recurringExpenses: RecurringExpense[]
): number {
  // Only count monthly income
  const monthlyIncome = incomes
    .filter((i) => i.cycle === "monthly")
    .reduce((sum, i) => sum + i.amount, 0);

  // Convert yearly income to monthly
  const yearlyToMonthly = incomes
    .filter((i) => i.cycle === "yearly")
    .reduce((sum, i) => sum + i.amount / 12, 0);

  // Convert weekly income to monthly (approx 4.33 weeks/month)
  const weeklyToMonthly = incomes
    .filter((i) => i.cycle === "weekly")
    .reduce((sum, i) => sum + i.amount * 4.33, 0);

  const totalMonthlyIncome = monthlyIncome + yearlyToMonthly + weeklyToMonthly;

  // Calculate monthly expenses
  const monthlyExpenses = recurringExpenses
    .filter((e) => e.cycle === "monthly")
    .reduce((sum, e) => sum + e.amount, 0);

  const yearlyExpensesToMonthly = recurringExpenses
    .filter((e) => e.cycle === "yearly")
    .reduce((sum, e) => sum + e.amount / 12, 0);

  const weeklyExpensesToMonthly = recurringExpenses
    .filter((e) => e.cycle === "weekly")
    .reduce((sum, e) => sum + e.amount * 4.33, 0);

  const totalMonthlyExpenses =
    monthlyExpenses + yearlyExpensesToMonthly + weeklyExpensesToMonthly;

  return totalMonthlyIncome - totalMonthlyExpenses;
}

/**
 * Build complete dashboard data
 */
export function buildDashboardData(
  incomes: Income[],
  debts: Debt[],
  credits: Credit[],
  recurringExpenses: RecurringExpense[],
  oneTimeBills: OneTimeBill[],
  banks: Bank[]
): DashboardData {
  const summary = calculateFinanceSummary(
    incomes,
    debts,
    credits,
    recurringExpenses,
    banks
  );
  const upcomingBills = getUpcomingBills(recurringExpenses, oneTimeBills, 7);
  const bankBalances = getBankBalanceSummaries(banks);
  const monthlyNetIncome = calculateMonthlyNetIncome(
    incomes,
    recurringExpenses
  );

  return {
    summary,
    upcomingBills,
    bankBalances,
    monthlyNetIncome,
  };
}
