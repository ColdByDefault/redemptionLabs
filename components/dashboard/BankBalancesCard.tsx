import type { BankBalanceSummary } from "@/types/finance";
import { formatCurrency } from "@/lib/utils";
import { BANK_NAME_LABELS } from "@/lib/constants";

interface BankBalancesCardProps {
  banks: BankBalanceSummary[];
  totalBalance: number;
}

export function BankBalancesCard({
  banks,
  totalBalance,
}: BankBalancesCardProps): React.ReactElement {
  if (banks.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Bank Balances
        </h3>
        <p className="text-sm text-muted-foreground">No banks configured</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Bank Balances
      </h3>
      <div className="space-y-2">
        {banks.map((bank) => (
          <div
            key={bank.name}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <span className="text-sm font-medium">
              {bank.displayName || BANK_NAME_LABELS[bank.name]}
            </span>
            <span
              className={`text-sm font-semibold ${
                bank.balance >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(bank.balance)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-semibold">Total</span>
          <span
            className={`text-base font-bold ${
              totalBalance >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(totalBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}
