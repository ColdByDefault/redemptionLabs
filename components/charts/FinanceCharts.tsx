import type { RecurringExpense, Income, Bank } from "@/types/finance";
import {
  buildExpenseBreakdownByCategory,
  buildExpenseBreakdownByName,
  buildIncomeVsExpensesData,
  buildBankBalanceHistory,
  buildBankBalanceByBank,
} from "@/lib/chart";
import { ExpensePieChart } from "./ExpensePieChart";
import { IncomeExpensesLineChart } from "./IncomeExpensesLineChart";
import { BankBalanceChart } from "./BankBalanceChart";

interface FinanceChartsProps {
  incomes: Income[];
  expenses: RecurringExpense[];
  banks: Bank[];
}

export function FinanceCharts({
  incomes,
  expenses,
  banks,
}: FinanceChartsProps): React.ReactElement {
  // Build chart data
  const expenseByCategory = buildExpenseBreakdownByCategory(expenses);
  const expenseByName = buildExpenseBreakdownByName(expenses);
  const incomeVsExpenses = buildIncomeVsExpensesData(incomes, expenses);
  const bankBalanceHistory = buildBankBalanceHistory(banks);
  const bankBalanceDistribution = buildBankBalanceByBank(banks);

  return (
    <div className="space-y-8">
      {/* Row 1: Income vs Expenses (Full Width) */}
      <div className="rounded-lg border bg-card p-6">
        <IncomeExpensesLineChart data={incomeVsExpenses} />
      </div>

      {/* Row 2: Expense Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-6">
          <ExpensePieChart
            data={expenseByCategory}
            title="Expenses by Category"
          />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <ExpensePieChart data={expenseByName} title="Expenses by Item" />
        </div>
      </div>

      {/* Row 3: Bank Balance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-6">
          <BankBalanceChart data={bankBalanceHistory} />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <ExpensePieChart
            data={bankBalanceDistribution}
            title="Balance by Bank"
          />
        </div>
      </div>
    </div>
  );
}
