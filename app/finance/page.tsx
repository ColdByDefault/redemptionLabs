import { getAllFinanceData } from "@/actions/finance";
import {
  IncomeSummaryBoard,
  RecurringExpensesBoard,
  OneTimeBillsBoard,
  BanksBoard,
} from "@/components/finance";

export default async function FinancePage(): Promise<React.ReactElement> {
  const { incomes, debts, credits, recurringExpenses, oneTimeBills, banks } =
    await getAllFinanceData();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Finance</h1>
        <p className="text-muted-foreground">
          Manage your income, expenses, debts, and bank accounts
        </p>
      </div>

      {/* Part 4: Banks */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Bank Accounts</h2>
        <BanksBoard banks={banks} />
      </section>

      {/* Part 1: Income, Debts & Credits Summary */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Income & Debts Overview</h2>
        <IncomeSummaryBoard
          incomes={incomes}
          debts={debts}
          credits={credits}
          recurringExpenses={recurringExpenses}
          oneTimeBills={oneTimeBills}
        />
      </section>

      {/* Part 2: Recurring Monthly Expenses */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recurring Expenses</h2>
        <RecurringExpensesBoard
          expenses={recurringExpenses}
          credits={credits}
          debts={debts}
        />
      </section>

      {/* Part 3: One-Time Bills */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">One-Time Bills</h2>
        <OneTimeBillsBoard bills={oneTimeBills} />
      </section>
    </div>
  );
}
