"use client";

import { useOptimistic, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import type { OneTimeBill, Bank } from "@/types/finance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getPaidStatusColor,
  formatCurrency,
  formatFinanceDate,
  formatPaidStatus,
  isOverdue,
  calculateTotalOneTimeBills,
} from "@/lib/finance";
import { updateOneTimeBill } from "@/actions/finance-editor";
import { FinanceDialog } from "./FinanceDialog";

interface OneTimeBillsBoardProps {
  bills: OneTimeBill[];
  banks: Bank[];
}

// Optimistic action type
type BillAction =
  | { type: "toggle_paid"; id: string }
  | { type: "update"; bill: OneTimeBill };

function billReducer(state: OneTimeBill[], action: BillAction): OneTimeBill[] {
  switch (action.type) {
    case "toggle_paid":
      return state.map((bill) =>
        bill.id === action.id ? { ...bill, isPaid: !bill.isPaid } : bill
      );
    case "update":
      return state.map((bill) =>
        bill.id === action.bill.id ? action.bill : bill
      );
    default:
      return state;
  }
}

export function OneTimeBillsBoard({
  bills,
  banks,
}: OneTimeBillsBoardProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [optimisticBills, addOptimisticAction] = useOptimistic(
    bills,
    billReducer
  );

  const unpaidTotal = calculateTotalOneTimeBills(optimisticBills);
  const unpaidCount = optimisticBills.filter((b) => !b.isPaid).length;
  const paidCount = optimisticBills.filter((b) => b.isPaid).length;

  // Helper to get linked bank name
  function getLinkedBankName(bankId: string | null): string {
    if (!bankId) return "";
    const bank = banks.find((b) => b.id === bankId);
    return bank?.displayName ?? "";
  }

  // Handle toggle paid status with optimistic update
  function handleTogglePaid(bill: OneTimeBill): void {
    startTransition(async () => {
      addOptimisticAction({ type: "toggle_paid", id: bill.id });
      await updateOneTimeBill({
        id: bill.id,
        isPaid: !bill.isPaid,
      });
    });
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Unpaid Total</p>
          <p className="text-2xl font-bold text-red-500">
            {formatCurrency(unpaidTotal)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Unpaid Bills</p>
          <p className="text-2xl font-bold text-yellow-500">{unpaidCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Paid Bills</p>
          <p className="text-2xl font-bold text-green-500">{paidCount}</p>
        </div>
      </div>

      <Separator />

      {/* Table */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">One-Time Bills</h3>
          <span className="text-sm text-muted-foreground">
            {optimisticBills.length} bills
          </span>
        </div>
        <FinanceDialog
          entityType="oneTimeBill"
          mode="create"
          banks={banks}
          trigger={
            <Button
              size="sm"
              className="cursor-pointer bg-green-600 hover:bg-green-700"
            >
              Add Bill
            </Button>
          }
        />
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Pay To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Linked Bank</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticBills.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  No one-time bills found
                </TableCell>
              </TableRow>
            ) : (
              optimisticBills.map((bill) => {
                const overdue = !bill.isPaid && isOverdue(bill.dueDate);
                return (
                  <TableRow
                    key={bill.id}
                    className={isPending ? "opacity-70" : ""}
                  >
                    <TableCell className="font-medium">
                      {bill.name}
                      {overdue && (
                        <span className="ml-2 text-red-500">⚠️ Overdue</span>
                      )}
                    </TableCell>
                    <TableCell
                      className={`font-semibold ${
                        bill.isPaid ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {formatCurrency(bill.amount)}
                    </TableCell>
                    <TableCell>{bill.payTo}</TableCell>
                    <TableCell
                      className={overdue ? "text-red-500 font-semibold" : ""}
                    >
                      {formatFinanceDate(bill.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaidStatusColor(bill.isPaid)}>
                        {formatPaidStatus(bill.isPaid)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bill.linkedBankId ? (
                        <Badge variant="secondary">
                          {getLinkedBankName(bill.linkedBankId)}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="max-w-40 truncate">
                      {bill.notes ?? "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer h-8 w-8"
                          onClick={() => handleTogglePaid(bill)}
                          disabled={isPending}
                          title={
                            bill.isPaid ? "Mark as unpaid" : "Mark as paid"
                          }
                        >
                          {bill.isPaid ? (
                            <X className="h-4 w-4 text-red-500" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <FinanceDialog
                          entityType="oneTimeBill"
                          entity={bill}
                          mode="edit"
                          banks={banks}
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
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
