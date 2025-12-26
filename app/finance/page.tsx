import { getAllFinanceData, getSectionTimestamps } from "@/actions/finance";
import {
  IncomeSummaryBoard,
  RecurringExpensesBoard,
  OneTimeBillsBoard,
  BanksBoard,
} from "@/components/finance";
import { SectionCard } from "@/components/ui/section-card";
import { SectionHeader } from "@/components/ui/section-header";

export default async function FinancePage(): Promise<React.ReactElement> {
  const [financeData, timestamps] = await Promise.all([
    getAllFinanceData(),
    getSectionTimestamps(),
  ]);
  const { incomes, debts, credits, recurringExpenses, oneTimeBills, banks } =
    financeData;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance</h1>
        <p className="text-muted-foreground">
          Manage your income, expenses, debts, and bank accounts
        </p>
      </div>

      {/* Part 4: Banks */}
      <SectionCard>
        <SectionHeader title="Bank Accounts" updatedAt={timestamps.banks} />
        <BanksBoard banks={banks} />
      </SectionCard>

      {/* Part 1: Income, Debts & Credits Summary */}
      <SectionCard>
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
      </SectionCard>

      {/* Part 2: Recurring Monthly Expenses */}
      <SectionCard>
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
      </SectionCard>

      {/* Part 3: One-Time Bills */}
      <SectionCard>
        <SectionHeader
          title="One-Time Bills"
          updatedAt={timestamps.one_time_bills}
        />
        <OneTimeBillsBoard bills={oneTimeBills} banks={banks} />
      </SectionCard>
    </div>
  );
}
