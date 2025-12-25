import { transactions } from "@/data/finance";
import { FinanceTable } from "./FinanceTable";
import { FinanceSummary } from "./FinanceSummary";

export function Finance() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Income & Expenses</h2>
        <p className="text-muted-foreground">
          Track your recurring income and expenses.
        </p>
      </div>
      <FinanceSummary transactions={transactions} />
      <div className="rounded-lg border">
        <FinanceTable transactions={transactions} />
      </div>
    </div>
  );
}
