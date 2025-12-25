import type { Account } from "@/types/account";
import { getTotalUsageCount, getAccountsByProvider } from "@/lib/accounts";

interface AccountSummaryProps {
  accounts: Account[];
}

export function AccountSummary({ accounts }: AccountSummaryProps) {
  const googleCount = getAccountsByProvider(accounts, "google").length;
  const icloudCount = getAccountsByProvider(accounts, "icloud").length;
  const totalUsages = getTotalUsageCount(accounts);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total Accounts</p>
        <p className="text-2xl font-bold">{accounts.length}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Google Accounts</p>
        <p className="text-2xl font-bold">{googleCount}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">iCloud Accounts</p>
        <p className="text-2xl font-bold">{icloudCount}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total Usages</p>
        <p className="text-2xl font-bold">{totalUsages}</p>
      </div>
    </div>
  );
}
