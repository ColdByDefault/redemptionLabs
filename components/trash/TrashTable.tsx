"use client";

import { useTransition } from "react";
import { formatRelativeDate } from "@/lib/utils";
import { AUDIT_ENTITY_LABELS } from "@/lib/constants";
import type { AuditEntity } from "@/types/audit";
import type { DeletedItemsData } from "@/actions/trash";
import {
  restoreIncome,
  restoreDebt,
  restoreCredit,
  restoreRecurringExpense,
  restoreOneTimeBill,
  restoreBank,
  restoreEmail,
  restoreAccount,
  restoreWishlistItem,
  permanentDeleteIncome,
  permanentDeleteDebt,
  permanentDeleteCredit,
  permanentDeleteRecurringExpense,
  permanentDeleteOneTimeBill,
  permanentDeleteBank,
  permanentDeleteEmail,
  permanentDeleteAccount,
  permanentDeleteWishlistItem,
  emptyTrash,
} from "@/actions/trash";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionCard } from "@/components/ui/section-card";
import { SectionHeader } from "@/components/ui/section-header";

interface TrashTableProps {
  data: DeletedItemsData;
}

interface NormalizedItem {
  id: string;
  name: string;
  entityType: AuditEntity;
  deletedAt: Date;
  details?: string;
}

function normalizeDeletedItems(data: DeletedItemsData): NormalizedItem[] {
  const items: NormalizedItem[] = [];

  data.emails.forEach((email) => {
    if (email.deletedAt) {
      items.push({
        id: email.id,
        name: email.email,
        entityType: "email",
        deletedAt: email.deletedAt,
        details: email.category,
      });
    }
  });

  data.accounts.forEach((account) => {
    if (account.deletedAt) {
      items.push({
        id: account.id,
        name: account.provider,
        entityType: "account",
        deletedAt: account.deletedAt,
        details: account.tier,
      });
    }
  });

  data.incomes.forEach((income) => {
    if (income.deletedAt) {
      items.push({
        id: income.id,
        name: income.source,
        entityType: "income",
        deletedAt: income.deletedAt,
        details: `€${income.amount.toFixed(2)}`,
      });
    }
  });

  data.debts.forEach((debt) => {
    if (debt.deletedAt) {
      items.push({
        id: debt.id,
        name: debt.name,
        entityType: "debt",
        deletedAt: debt.deletedAt,
        details: `€${debt.remainingAmount.toFixed(2)} remaining`,
      });
    }
  });

  data.credits.forEach((credit) => {
    if (credit.deletedAt) {
      items.push({
        id: credit.id,
        name: credit.provider,
        entityType: "credit",
        deletedAt: credit.deletedAt,
        details: `€${credit.usedAmount.toFixed(2)} used`,
      });
    }
  });

  data.recurringExpenses.forEach((expense) => {
    if (expense.deletedAt) {
      items.push({
        id: expense.id,
        name: expense.name,
        entityType: "recurring_expense",
        deletedAt: expense.deletedAt,
        details: `€${expense.amount.toFixed(2)} / ${expense.cycle}`,
      });
    }
  });

  data.oneTimeBills.forEach((bill) => {
    if (bill.deletedAt) {
      items.push({
        id: bill.id,
        name: bill.name,
        entityType: "one_time_bill",
        deletedAt: bill.deletedAt,
        details: `€${bill.amount.toFixed(2)}`,
      });
    }
  });

  data.banks.forEach((bank) => {
    if (bank.deletedAt) {
      items.push({
        id: bank.id,
        name: bank.displayName,
        entityType: "bank",
        deletedAt: bank.deletedAt,
        details: `€${bank.balance.toFixed(2)}`,
      });
    }
  });

  data.wishlistItems.forEach((item) => {
    if (item.deletedAt) {
      items.push({
        id: item.id,
        name: item.name,
        entityType: "wishlist_item",
        deletedAt: item.deletedAt,
        details: `€${item.price.toFixed(2)}`,
      });
    }
  });

  // Sort by deleted date, most recent first
  return items.sort(
    (a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
  );
}

function getRestoreAction(
  entityType: AuditEntity
): (id: string) => Promise<{ success: boolean; error?: string }> {
  switch (entityType) {
    case "email":
      return restoreEmail;
    case "account":
      return restoreAccount;
    case "income":
      return restoreIncome;
    case "debt":
      return restoreDebt;
    case "credit":
      return restoreCredit;
    case "recurring_expense":
      return restoreRecurringExpense;
    case "one_time_bill":
      return restoreOneTimeBill;
    case "bank":
      return restoreBank;
    case "wishlist_item":
      return restoreWishlistItem;
    default:
      return async () => ({ success: false, error: "Unknown entity type" });
  }
}

function getDeleteAction(
  entityType: AuditEntity
): (id: string) => Promise<{ success: boolean; error?: string }> {
  switch (entityType) {
    case "email":
      return permanentDeleteEmail;
    case "account":
      return permanentDeleteAccount;
    case "income":
      return permanentDeleteIncome;
    case "debt":
      return permanentDeleteDebt;
    case "credit":
      return permanentDeleteCredit;
    case "recurring_expense":
      return permanentDeleteRecurringExpense;
    case "one_time_bill":
      return permanentDeleteOneTimeBill;
    case "bank":
      return permanentDeleteBank;
    case "wishlist_item":
      return permanentDeleteWishlistItem;
    default:
      return async () => ({ success: false, error: "Unknown entity type" });
  }
}

export function TrashTable({ data }: TrashTableProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const items = normalizeDeletedItems(data);

  const handleRestore = (item: NormalizedItem): void => {
    startTransition(async () => {
      const action = getRestoreAction(item.entityType);
      await action(item.id);
    });
  };

  const handlePermanentDelete = (item: NormalizedItem): void => {
    if (!confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const action = getDeleteAction(item.entityType);
      await action(item.id);
    });
  };

  const handleEmptyTrash = (): void => {
    if (
      !confirm("Permanently delete ALL items in trash? This cannot be undone.")
    ) {
      return;
    }
    startTransition(async () => {
      await emptyTrash();
    });
  };

  if (items.length === 0) {
    return (
      <SectionCard>
        <SectionHeader title="Trash" subtitle="No deleted items" />
        <div className="py-8 text-center text-muted-foreground">
          <p>Trash is empty 🎉</p>
          <p className="text-sm mt-2">
            Deleted items will appear here for recovery
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Trash"
          subtitle={`${items.length} deleted item${
            items.length === 1 ? "" : "s"
          }`}
        />
        <Button
          variant="destructive"
          size="sm"
          onClick={handleEmptyTrash}
          disabled={isPending}
        >
          Empty Trash
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Deleted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`${item.entityType}-${item.id}`}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {AUDIT_ENTITY_LABELS[item.entityType]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {item.details ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatRelativeDate(item.deletedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(item)}
                    disabled={isPending}
                  >
                    Restore
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handlePermanentDelete(item)}
                    disabled={isPending}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  );
}
