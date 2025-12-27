import type { DashboardData } from "@/types/finance";
import { formatCurrency } from "@/lib/utils";
import { SummaryCard } from "./SummaryCard";
import { UpcomingBillsCard } from "./UpcomingBillsCard";
import { BankBalancesCard } from "./BankBalancesCard";

interface DashboardProps {
  data: DashboardData;
}

export function Dashboard({ data }: DashboardProps): React.ReactElement {
  const { summary, upcomingBills, bankBalances, monthlyNetIncome } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Monthly Income"
          value={formatCurrency(summary.totalIncome)}
          subtitle="Total recurring income"
          variant="positive"
        />
        <SummaryCard
          title="Monthly Expenses"
          value={formatCurrency(summary.totalExpensesWithDebts)}
          subtitle="Subscriptions + debts"
          variant="negative"
        />
        <SummaryCard
          title="Net Monthly"
          value={formatCurrency(monthlyNetIncome)}
          subtitle="Income - Expenses"
          variant={monthlyNetIncome >= 0 ? "positive" : "negative"}
        />
        <SummaryCard
          title="Total Bank Balance"
          value={formatCurrency(summary.totalBankBalance)}
          subtitle="Across all accounts"
          variant={summary.totalBankBalance >= 0 ? "positive" : "negative"}
        />
      </div>

      {/* Upcoming Bills & Bank Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UpcomingBillsCard bills={upcomingBills} />
        <BankBalancesCard
          banks={bankBalances}
          totalBalance={summary.totalBankBalance}
        />
      </div>
    </div>
  );
}
