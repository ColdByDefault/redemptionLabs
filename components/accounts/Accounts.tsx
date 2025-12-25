import { accounts } from "@/data/accounts";
import { AccountTable } from "./AccountTable";
import { AccountSummary } from "./AccountSummary";

export function Accounts() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
        <p className="text-muted-foreground">
          Manage your Google and iCloud accounts and track where they are used.
        </p>
      </div>
      <AccountSummary accounts={accounts} />
      <div className="rounded-lg border">
        <AccountTable accounts={accounts} />
      </div>
    </div>
  );
}
