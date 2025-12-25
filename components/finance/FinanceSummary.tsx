import type { Transaction } from "@/types/finance";
import {
  formatCurrency,
  getTotalMonthlyIncome,
  getTotalMonthlyExpenses,
  getTotalYearlyIncome,
  getTotalYearlyExpenses,
  getMonthlyBalance,
  getYearlyBalance,
} from "@/lib/finance";

interface FinanceSummaryProps {
  transactions: Transaction[];
}

export function FinanceSummary({ transactions }: FinanceSummaryProps) {
  const monthlyIncome = getTotalMonthlyIncome(transactions);
  const monthlyExpenses = getTotalMonthlyExpenses(transactions);
  const monthlyBalance = getMonthlyBalance(transactions);
  const yearlyIncome = getTotalYearlyIncome(transactions);
  const yearlyExpenses = getTotalYearlyExpenses(transactions);
  const yearlyBalance = getYearlyBalance(transactions);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Monthly Income</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(monthlyIncome)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Monthly Expenses</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(monthlyExpenses)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Monthly Balance</p>
          <p
            className={`text-2xl font-bold ${
              monthlyBalance >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(monthlyBalance)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Yearly Income</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(yearlyIncome)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Yearly Expenses</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(yearlyExpenses)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Yearly Balance</p>
          <p
            className={`text-2xl font-bold ${
              yearlyBalance >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(yearlyBalance)}
          </p>
        </div>
      </div>
    </div>
  );
}
