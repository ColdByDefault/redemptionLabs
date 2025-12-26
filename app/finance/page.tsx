import { getAllFinanceData, getSectionTimestamps } from "@/actions/finance";
import {
  IncomeSummaryBoard,
  RecurringExpensesBoard,
  OneTimeBillsBoard,
  BanksBoard,
} from "@/components/finance";
import { SectionHeader } from "@/components/ui/section-header";

export default async function FinancePage(): Promise<React.ReactElement> {
  const [financeData, timestamps] = await Promise.all([
    getAllFinanceData(),
    getSectionTimestamps(),
  ]);
  const { incomes, debts, credits, recurringExpenses, oneTimeBills, banks } =
    financeData;

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
        <SectionHeader title="Bank Accounts" updatedAt={timestamps.banks} />
        <BanksBoard banks={banks} />
      </section>

      <hr className="border-border" />

      {/* Part 1: Income, Debts & Credits Summary */}
      <section className="space-y-4">
        <SectionHeader
          title="Income & Debts Overview"
          updatedAt={timestamps.income_overview}
        />
        <IncomeSummaryBoard
          incomes={incomes}
          debts={debts}
          credits={credits}
          recurringExpenses={recurringExpenses}
          oneTimeBills={oneTimeBills}
        />
      </section>

      <hr className="border-border" />

      {/* Part 2: Recurring Monthly Expenses */}
      <section className="space-y-4">
        <SectionHeader
          title="Recurring Expenses"
          updatedAt={timestamps.recurring_expenses}
        />
        <RecurringExpensesBoard
          expenses={recurringExpenses}
          credits={credits}
          debts={debts}
          banks={banks}
        />
      </section>

      <hr className="border-border" />

      {/* Part 3: One-Time Bills */}
      <section className="space-y-4">
        <SectionHeader
          title="One-Time Bills"
          updatedAt={timestamps.one_time_bills}
        />
        <OneTimeBillsBoard bills={oneTimeBills} banks={banks} />
      </section>
    </div>
  );
}
