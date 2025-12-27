"use client";

import { Pencil } from "lucide-react";
import type { Bank } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrency,
  formatBankName,
  formatRelativeTime,
  calculateTotalBankBalance,
} from "@/lib/finance";
import { FinanceDialog } from "./FinanceDialog";

interface BanksBoardProps {
  banks: Bank[];
}

export function BanksBoard({ banks }: BanksBoardProps): React.ReactElement {
  const totalBalance = calculateTotalBankBalance(banks);

  return (
    <div className="space-y-4">
      {/* Total Balance */}
      <div className="rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">Total Balance</p>
        <p
          className={`text-3xl font-bold ${
            totalBalance >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {formatCurrency(totalBalance)}
        </p>
      </div>

      <Separator />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Bank Accounts</h3>
          <span className="text-sm text-muted-foreground">
            {banks.length} accounts
          </span>
        </div>
        <FinanceDialog
          entityType="bank"
          mode="create"
          trigger={
            <Button
              size="sm"
              className="cursor-pointer bg-green-600 hover:bg-green-700"
            >
              Add Bank
            </Button>
          }
        />
      </div>

      {/* Bank Cards */}
      {banks.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          No bank accounts found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {banks.map((bank) => (
            <div
              key={bank.id}
              className="rounded-lg border p-4 space-y-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                  {formatBankName(bank.name)}
                </Badge>
                <FinanceDialog
                  entityType="bank"
                  entity={bank}
                  mode="edit"
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {bank.displayName}
              </p>
              <p
                className={`text-2xl font-bold ${
                  bank.balance >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {formatCurrency(bank.balance)}
              </p>
              <p className="text-xs text-muted-foreground">
                Updated: {formatRelativeTime(bank.lastBalanceUpdate)}
              </p>
              {bank.notes && (
                <p className="text-xs text-muted-foreground truncate">
                  {bank.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
