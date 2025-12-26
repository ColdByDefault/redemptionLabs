"use client";

import { Pencil } from "lucide-react";
import type {
  Income,
  Debt,
  Credit,
  RecurringExpense,
  OneTimeBill,
} from "@/types/finance";
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
  getPaymentCycleColor,
  formatCurrency,
  formatFinanceDate,
  formatPaymentCycle,
  formatPercentage,
  formatMonthsRemaining,
  calculateTotalIncome,
  calculateTotalDebts,
  calculateTotalRecurringExpenses,
  calculateTotalOneTimeBills,
  calculateTotalCreditLimit,
  calculateTotalCredits,
  calculateTotalCreditAvailable,
} from "@/lib/finance";
import { FinanceDialog } from "./FinanceDialog";

interface IncomeSummaryBoardProps {
  incomes: Income[];
  debts: Debt[];
  credits: Credit[];
  recurringExpenses: RecurringExpense[];
  oneTimeBills: OneTimeBill[];
}

export function IncomeSummaryBoard({
  incomes,
  debts,
  credits,
  recurringExpenses,
  oneTimeBills,
}: IncomeSummaryBoardProps): React.ReactElement {
  const totalIncome = calculateTotalIncome(incomes);
  const totalDebts = calculateTotalDebts(debts);
  const totalRecurring = calculateTotalRecurringExpenses(recurringExpenses);
  const totalOneTime = calculateTotalOneTimeBills(oneTimeBills);
  const totalExpenses = totalRecurring + totalOneTime;

  return (
    <div className="space-y-6">
      {/* Summary Cards - Black & White theme, Income green, Expenses red */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="text-2xl font-bold text-green-500">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold text-red-500">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Monthly: {formatCurrency(totalRecurring)} + One-time:{" "}
            {formatCurrency(totalOneTime)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Debts</p>
          <p className="text-2xl font-bold">{formatCurrency(totalDebts)}</p>
        </div>
      </div>

      {/* Income Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Income Sources</h3>
            <span className="text-sm text-muted-foreground">
              {incomes.length} sources
            </span>
          </div>
          <FinanceDialog
            entityType="income"
            mode="create"
            trigger={
              <Button size="sm" className="cursor-pointer">
                Add Income
              </Button>
            }
          />
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Next Payment</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No income sources found
                  </TableCell>
                </TableRow>
              ) : (
                incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell className="font-medium">
                      {income.source}
                    </TableCell>
                    <TableCell className="text-green-500 font-semibold">
                      {formatCurrency(income.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentCycleColor(income.cycle)}>
                        {formatPaymentCycle(income.cycle)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatFinanceDate(income.nextPaymentDate)}
                    </TableCell>
                    <TableCell className="max-w-40 truncate">
                      {income.notes ?? "-"}
                    </TableCell>
                    <TableCell>
                      <FinanceDialog
                        entityType="income"
                        entity={income}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Debts Table - added Payment Month column */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Debts</h3>
            <span className="text-sm text-muted-foreground">
              {debts.length} debts
            </span>
          </div>
          <FinanceDialog
            entityType="debt"
            mode="create"
            trigger={
              <Button size="sm" className="cursor-pointer">
                Add Debt
              </Button>
            }
          />
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Pay To</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Payment Month</TableHead>
                <TableHead>Time Left</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground"
                  >
                    No debts found
                  </TableCell>
                </TableRow>
              ) : (
                debts.map((debt) => (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium">{debt.name}</TableCell>
                    <TableCell>{formatCurrency(debt.amount)}</TableCell>
                    <TableCell className="text-red-500 font-semibold">
                      {formatCurrency(debt.remainingAmount)}
                    </TableCell>
                    <TableCell>{debt.payTo}</TableCell>
                    <TableCell>
                      <Badge className={getPaymentCycleColor(debt.cycle)}>
                        {formatPaymentCycle(debt.cycle)}
                      </Badge>
                    </TableCell>
                    <TableCell>{debt.paymentMonth ?? "-"}</TableCell>
                    <TableCell>
                      {formatMonthsRemaining(debt.monthsRemaining)}
                    </TableCell>
                    <TableCell>{formatFinanceDate(debt.dueDate)}</TableCell>
                    <TableCell className="max-w-40 truncate">
                      {debt.notes ?? "-"}
                    </TableCell>
                    <TableCell>
                      <FinanceDialog
                        entityType="debt"
                        entity={debt}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Credits Table - Total + Used + Available */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Available Credits</h3>
            <span className="text-sm text-muted-foreground">
              {credits.length} credits
            </span>
          </div>
          <FinanceDialog
            entityType="credit"
            mode="create"
            trigger={
              <Button size="sm" className="cursor-pointer">
                Add Credit
              </Button>
            }
          />
        </div>
        {/* Credit Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Limit</p>
            <p className="text-lg font-bold">
              {formatCurrency(calculateTotalCreditLimit(credits))}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Used</p>
            <p className="text-lg font-bold text-red-500">
              {formatCurrency(calculateTotalCredits(credits))}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Available</p>
            <p className="text-lg font-bold text-green-500">
              {formatCurrency(calculateTotalCreditAvailable(credits))}
            </p>
          </div>
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Total Limit</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credits.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    No credits found
                  </TableCell>
                </TableRow>
              ) : (
                credits.map((credit) => (
                  <TableRow key={credit.id}>
                    <TableCell className="font-medium">
                      {credit.provider}
                    </TableCell>
                    <TableCell>{formatCurrency(credit.totalLimit)}</TableCell>
                    <TableCell className="text-red-500 font-semibold">
                      {formatCurrency(credit.usedAmount)}
                    </TableCell>
                    <TableCell className="text-green-500 font-semibold">
                      {formatCurrency(credit.totalLimit - credit.usedAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatPercentage(credit.interestRate)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFinanceDate(credit.dueDate)}</TableCell>
                    <TableCell className="max-w-40 truncate">
                      {credit.notes ?? "-"}
                    </TableCell>
                    <TableCell>
                      <FinanceDialog
                        entityType="credit"
                        entity={credit}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
