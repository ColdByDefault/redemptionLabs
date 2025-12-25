import { prisma } from "@/lib/prisma";
import { AccountTable } from "./AccountTable";
import { AccountSummary } from "./AccountSummary";
import { EntityCreator } from "@/components/editor";
import type { Account } from "@/types/account";

export async function Accounts(): Promise<React.ReactElement> {
  const dbAccounts = await prisma.account.findMany({
    include: { usages: true },
    orderBy: { createdAt: "asc" },
  });

  const accounts: Account[] = dbAccounts.map((a) => ({
    id: a.id,
    email: a.email,
    provider: a.provider as Account["provider"],
    label: a.label,
    isPrimary: a.isPrimary,
    notes: a.notes,
    usages: a.usages.map((u) => ({
      service: u.service,
      category: u.category as Account["usages"][number]["category"],
      description: u.description,
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">
            Manage your Google and iCloud accounts and track where they are
            used.
          </p>
        </div>
        <EntityCreator entityType="account" />
      </div>
      <AccountSummary accounts={accounts} />
      <div className="rounded-lg border">
        <AccountTable accounts={accounts} />
      </div>
    </div>
  );
}
