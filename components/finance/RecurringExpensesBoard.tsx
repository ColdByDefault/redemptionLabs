"use client";

import { Pencil } from "lucide-react";
import type { RecurringExpense, Credit, Debt, Bank } from "@/types/finance";
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
import {
  getRecurringCycleColor,
  getTrialTypeColor,
  getExpenseCategoryColor,
  formatCurrency,
  formatFinanceDate,
  formatRecurringCycle,
  formatTrialType,
  formatExpenseCategory,
  isTrialExpiring,
  calculateTotalRecurringExpenses,
} from "@/lib/finance";
import { FinanceDialog } from "./FinanceDialog";

interface RecurringExpensesBoardProps {
  expenses: RecurringExpense[];
  credits: Credit[];
  debts: Debt[];
  banks: Bank[];
}

export function RecurringExpensesBoard({
  expenses,
  credits,
  debts,
  banks,
}: RecurringExpensesBoardProps): React.ReactElement {
  const totalExpenses = calculateTotalRecurringExpenses(expenses);
  const subscriptions = expenses.filter((e) => e.category === "subscription");
  const debtExpenses = expenses.filter((e) => e.category === "debt");

  // Helper to get linked credit provider name
  function getLinkedCreditName(creditId: string | null): string {
    if (!creditId) return "";
    const credit = credits.find((c) => c.id === creditId);
    return credit?.provider ?? "";
  }

  // Helper to get linked debt name
  function getLinkedDebtName(debtId: string | null): string {
    if (!debtId) return "";
    const debt = debts.find((d) => d.id === debtId);
    return debt?.name ?? "";
  }

  // Helper to get linked bank name
  function getLinkedBankName(bankId: string | null): string {
    if (!bankId) return "";
    const bank = banks.find((b) => b.id === bankId);
    return bank?.displayName ?? "";
  }

  // Helper to get linked to display (credit or debt)
  function getLinkedToDisplay(expense: RecurringExpense): string {
    const creditName = getLinkedCreditName(expense.linkedCreditId);
    const debtName = getLinkedDebtName(expense.linkedDebtId);
    if (creditName && debtName) return `${creditName}, ${debtName}`;
    if (creditName) return creditName;
    if (debtName) return debtName;
    return "-";
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Monthly</p>
          <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Subscriptions</p>
          <p className="text-2xl font-bold text-green-500">
            {subscriptions.length}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Credit Paybacks</p>
          <p className="text-2xl font-bold text-red-500">
            {debtExpenses.length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Recurring Expenses</h3>
          <span className="text-sm text-muted-foreground">
            {expenses.length} expenses
          </span>
        </div>
        <FinanceDialog
          entityType="recurringExpense"
          mode="create"
          credits={credits}
          debts={debts}
          banks={banks}
          trigger={
            <Button size="sm" className="cursor-pointer">
              Add Expense
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
              <TableHead>Cycle</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Trial</TableHead>
              <TableHead>Trial Ends</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Linked To</TableHead>
              <TableHead>Linked Bank</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center text-muted-foreground"
                >
                  No recurring expenses found
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => {
                const expiring = isTrialExpiring(
                  expense.trialType,
                  expense.trialEndDate
                );
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.name}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getRecurringCycleColor(expense.cycle)}>
                        {formatRecurringCycle(expense.cycle)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFinanceDate(expense.dueDate)}</TableCell>
                    <TableCell>
                      <Badge className={getTrialTypeColor(expense.trialType)}>
                        {formatTrialType(expense.trialType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {expense.trialType !== "none" ? (
                        <span
                          className={
                            expiring ? "text-red-500 font-semibold" : ""
                          }
                        >
                          {formatFinanceDate(expense.trialEndDate)}
                          {expiring && " ⚠️"}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getExpenseCategoryColor(expense.category)}
                      >
                        {formatExpenseCategory(expense.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getLinkedToDisplay(expense)}</TableCell>
                    <TableCell>
                      {expense.linkedBankId ? (
                        <Badge variant="secondary">
                          {getLinkedBankName(expense.linkedBankId)}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="max-w-40 truncate">
                      {expense.notes ?? "-"}
                    </TableCell>
                    <TableCell>
                      <FinanceDialog
                        entityType="recurringExpense"
                        entity={expense}
                        credits={credits}
                        debts={debts}
                        banks={banks}
                        mode="edit"
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
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
