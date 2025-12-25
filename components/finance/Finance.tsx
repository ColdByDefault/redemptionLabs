import { prisma } from "@/lib/prisma";
import { FinanceTable } from "./FinanceTable";
import { FinanceSummary } from "./FinanceSummary";
import type { Transaction } from "@/types/finance";

export async function Finance(): Promise<React.ReactElement> {
  const dbTransactions = await prisma.transaction.findMany({
    orderBy: { dueDay: "asc" },
  });

  const transactions: Transaction[] = dbTransactions.map((t) => ({
    id: t.id,
    name: t.name,
    amount: t.amount,
    type: t.type as Transaction["type"],
    frequency: t.frequency.replace("_", "-") as Transaction["frequency"],
    category: t.category as Transaction["category"],
    dueDay: t.dueDay,
    isActive: t.isActive,
    notes: t.notes,
  }));

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
