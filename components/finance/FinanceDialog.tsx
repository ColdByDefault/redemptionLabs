"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createIncome,
  updateIncome,
  deleteIncome,
  createDebt,
  updateDebt,
  deleteDebt,
  createCredit,
  updateCredit,
  deleteCredit,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  createOneTimeBill,
  updateOneTimeBill,
  deleteOneTimeBill,
  createBank,
  updateBank,
  deleteBank,
} from "@/actions/finance-editor";
import { formatDateForInput } from "@/lib/finance";
import type {
  Income,
  Debt,
  Credit,
  RecurringExpense,
  OneTimeBill,
  Bank,
  PaymentCycle,
  RecurringCycle,
  TrialType,
  ExpenseCategory,
  BankName,
} from "@/types/finance";

// ============================================================
// TYPES
// ============================================================

type EntityType =
  | "income"
  | "debt"
  | "credit"
  | "recurringExpense"
  | "oneTimeBill"
  | "bank";

type EntityData =
  | Income
  | Debt
  | Credit
  | RecurringExpense
  | OneTimeBill
  | Bank;

interface FinanceDialogProps {
  entityType: EntityType;
  entity?: EntityData;
  trigger: React.ReactNode;
  mode: "create" | "edit";
  // For recurring expenses - optional linked data
  credits?: Credit[];
  debts?: Debt[];
}

// ============================================================
// CONSTANTS
// ============================================================

const PAYMENT_CYCLES: PaymentCycle[] = [
  "monthly",
  "yearly",
  "weekly",
  "onetime",
];
const RECURRING_CYCLES: RecurringCycle[] = ["monthly", "yearly", "weekly"];
const TRIAL_TYPES: TrialType[] = ["none", "week", "month", "custom"];
const EXPENSE_CATEGORIES: ExpenseCategory[] = ["subscription", "debt"];
const BANK_NAMES: { value: BankName; label: string }[] = [
  { value: "volksbank", label: "Volksbank" },
  { value: "sparkasse", label: "Sparkasse" },
  { value: "volksbank_visa", label: "Volksbank Visa" },
  { value: "paypal", label: "PayPal" },
];

const ENTITY_LABELS: Record<EntityType, { singular: string; plural: string }> =
  {
    income: { singular: "Income", plural: "Incomes" },
    debt: { singular: "Debt", plural: "Debts" },
    credit: { singular: "Credit", plural: "Credits" },
    recurringExpense: {
      singular: "Recurring Expense",
      plural: "Recurring Expenses",
    },
    oneTimeBill: { singular: "Bill", plural: "Bills" },
    bank: { singular: "Bank", plural: "Banks" },
  };

// ============================================================
// COMPONENT
// ============================================================

export function FinanceDialog({
  entityType,
  entity,
  trigger,
  mode,
  credits = [],
  debts = [],
}: FinanceDialogProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const label = ENTITY_LABELS[entityType];

  // Helper to safely get form values with empty string fallback
  function getField(key: string): string {
    return formData[key] ?? "";
  }

  // Initialize form data based on entity type
  useEffect(() => {
    setFormData(getInitialFormData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, entityType]);

  function getInitialFormData(): Record<string, string> {
    switch (entityType) {
      case "income": {
        const income = entity as Income | undefined;
        return {
          source: income?.source ?? "",
          amount: income?.amount?.toString() ?? "",
          cycle: income?.cycle ?? "monthly",
          nextPaymentDate: formatDateForInput(income?.nextPaymentDate),
          notes: income?.notes ?? "",
        };
      }
      case "debt": {
        const debt = entity as Debt | undefined;
        return {
          name: debt?.name ?? "",
          amount: debt?.amount?.toString() ?? "",
          remainingAmount: debt?.remainingAmount?.toString() ?? "",
          payTo: debt?.payTo ?? "",
          cycle: debt?.cycle ?? "monthly",
          paymentMonth: debt?.paymentMonth ?? "",
          dueDate: formatDateForInput(debt?.dueDate),
          monthsRemaining: debt?.monthsRemaining?.toString() ?? "",
          notes: debt?.notes ?? "",
        };
      }
      case "credit": {
        const credit = entity as Credit | undefined;
        return {
          provider: credit?.provider ?? "",
          totalLimit: credit?.totalLimit?.toString() ?? "",
          usedAmount: credit?.usedAmount?.toString() ?? "0",
          interestRate: credit?.interestRate?.toString() ?? "",
          dueDate: formatDateForInput(credit?.dueDate),
          notes: credit?.notes ?? "",
        };
      }
      case "recurringExpense": {
        const expense = entity as RecurringExpense | undefined;
        return {
          name: expense?.name ?? "",
          amount: expense?.amount?.toString() ?? "",
          dueDate: formatDateForInput(expense?.dueDate),
          cycle: expense?.cycle ?? "monthly",
          trialType: expense?.trialType ?? "none",
          trialEndDate: formatDateForInput(expense?.trialEndDate),
          category: expense?.category ?? "subscription",
          linkedCreditId: expense?.linkedCreditId ?? "",
          linkedDebtId: expense?.linkedDebtId ?? "",
          notes: expense?.notes ?? "",
        };
      }
      case "oneTimeBill": {
        const bill = entity as OneTimeBill | undefined;
        return {
          name: bill?.name ?? "",
          amount: bill?.amount?.toString() ?? "",
          payTo: bill?.payTo ?? "",
          dueDate: formatDateForInput(bill?.dueDate),
          isPaid: bill?.isPaid ? "true" : "false",
          notes: bill?.notes ?? "",
        };
      }
      case "bank": {
        const bank = entity as Bank | undefined;
        return {
          name: bank?.name ?? "volksbank",
          displayName: bank?.displayName ?? "",
          balance: bank?.balance?.toString() ?? "0",
          notes: bank?.notes ?? "",
        };
      }
      default:
        return {};
    }
  }

  function resetForm(): void {
    setFormData(getInitialFormData());
  }

  function updateField(field: string, value: string): void {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);

    try {
      const result =
        mode === "create" ? await handleCreate() : await handleUpdate();

      if (result.success) {
        toast.success(
          `${label.singular} ${
            mode === "create" ? "created" : "updated"
          } successfully`
        );
        setOpen(false);
        if (mode === "create") resetForm();
      } else {
        toast.error(
          result.error ?? `Failed to ${mode} ${label.singular.toLowerCase()}`
        );
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(): Promise<{ success: boolean; error?: string }> {
    switch (entityType) {
      case "income":
        return createIncome({
          source: getField("source"),
          amount: parseFloat(getField("amount")),
          cycle: getField("cycle") as PaymentCycle,
          nextPaymentDate: getField("nextPaymentDate")
            ? new Date(getField("nextPaymentDate"))
            : null,
          notes: getField("notes") || null,
        });
      case "debt":
        return createDebt({
          name: getField("name"),
          amount: parseFloat(getField("amount")),
          remainingAmount: parseFloat(getField("remainingAmount")),
          payTo: getField("payTo"),
          cycle: getField("cycle") as PaymentCycle,
          paymentMonth: getField("paymentMonth") || null,
          dueDate: getField("dueDate") ? new Date(getField("dueDate")) : null,
          monthsRemaining: getField("monthsRemaining")
            ? parseInt(getField("monthsRemaining"))
            : null,
          notes: getField("notes") || null,
        });
      case "credit":
        return createCredit({
          provider: getField("provider"),
          totalLimit: parseFloat(getField("totalLimit")),
          usedAmount: parseFloat(getField("usedAmount")),
          interestRate: parseFloat(getField("interestRate")),
          dueDate: getField("dueDate") ? new Date(getField("dueDate")) : null,
          notes: getField("notes") || null,
        });
      case "recurringExpense":
        return createRecurringExpense({
          name: getField("name"),
          amount: parseFloat(getField("amount")),
          dueDate: getField("dueDate") ? new Date(getField("dueDate")) : null,
          cycle: getField("cycle") as RecurringCycle,
          trialType: getField("trialType") as TrialType,
          trialEndDate: getField("trialEndDate")
            ? new Date(getField("trialEndDate"))
            : null,
          category: getField("category") as ExpenseCategory,
          linkedCreditId: getField("linkedCreditId") || null,
          linkedDebtId: getField("linkedDebtId") || null,
          notes: getField("notes") || null,
        });
      case "oneTimeBill":
        return createOneTimeBill({
          name: getField("name"),
          amount: parseFloat(getField("amount")),
          payTo: getField("payTo"),
          dueDate: getField("dueDate") ? new Date(getField("dueDate")) : null,
          isPaid: getField("isPaid") === "true",
          notes: getField("notes") || null,
        });
      case "bank":
        return createBank({
          name: getField("name") as BankName,
          displayName: getField("displayName"),
          balance: parseFloat(getField("balance")),
          notes: getField("notes") || null,
        });
      default:
        return { success: false, error: "Unknown entity type" };
    }
  }

  async function handleUpdate(): Promise<{ success: boolean; error?: string }> {
    if (!entity) return { success: false, error: "No entity to update" };

    switch (entityType) {
      case "income":
        return updateIncome({
          id: entity.id,
          source: getField("source"),
          amount: parseFloat(getField("amount")),
          cycle: getField("cycle") as PaymentCycle,
          nextPaymentDate: getField("nextPaymentDate")
            ? new Date(getField("nextPaymentDate"))
            : null,
          notes: getField("notes") || null,
        });
      case "debt":
        return updateDebt({
          id: entity.id,
          name: getField("name"),
          amount: parseFloat(getField("amount")),
          remainingAmount: parseFloat(getField("remainingAmount")),
          payTo: getField("payTo"),
          cycle: getField("cycle") as PaymentCycle,
          paymentMonth: getField("paymentMonth") || null,
          dueDate: getField("dueDate") ? new Date(getField("dueDate")) : null,
          monthsRemaining: getField("monthsRemaining")
            ? parseInt(getField("monthsRemaining"))
            : null,
          notes: getField("notes") || null,
        });
      case "credit":
        return updateCredit({
          id: entity.id,
          provider: getField("provider"),
          totalLimit: parseFloat(getField("totalLimit")),
          usedAmount: parseFloat(getField("usedAmount")),
          interestRate: parseFloat(getField("interestRate")),
          dueDate: getField("dueDate") ? new Date(getField("dueDate")) : null,
          notes: getField("notes") || null,
        });
      case "recurringExpense":
        return updateRecurringExpense({
          id: entity.id,
          name: getField("name"),
          amount: parseFloat(getField("amount")),
          dueDate: getField("dueDate") ? new Date(getField("dueDate")) : null,
          cycle: getField("cycle") as RecurringCycle,
          trialType: getField("trialType") as TrialType,
          trialEndDate: getField("trialEndDate")
            ? new Date(getField("trialEndDate"))
            : null,
          category: getField("category") as ExpenseCategory,
          linkedCreditId: getField("linkedCreditId") || null,
          linkedDebtId: getField("linkedDebtId") || null,
          notes: getField("notes") || null,
        });
      case "oneTimeBill":
        return updateOneTimeBill({
          id: entity.id,
          name: getField("name"),
          amount: parseFloat(getField("amount")),
          payTo: getField("payTo"),
          dueDate: getField("dueDate") ? new Date(getField("dueDate")) : null,
          isPaid: getField("isPaid") === "true",
          notes: getField("notes") || null,
        });
      case "bank":
        return updateBank({
          id: entity.id,
          name: getField("name") as BankName,
          displayName: getField("displayName"),
          balance: parseFloat(getField("balance")),
          notes: getField("notes") || null,
        });
      default:
        return { success: false, error: "Unknown entity type" };
    }
  }

  async function handleDelete(): Promise<void> {
    if (!entity) return;
    setLoading(true);

    try {
      let result: { success: boolean; error?: string };
      switch (entityType) {
        case "income":
          result = await deleteIncome(entity.id);
          break;
        case "debt":
          result = await deleteDebt(entity.id);
          break;
        case "credit":
          result = await deleteCredit(entity.id);
          break;
        case "recurringExpense":
          result = await deleteRecurringExpense(entity.id);
          break;
        case "oneTimeBill":
          result = await deleteOneTimeBill(entity.id);
          break;
        case "bank":
          result = await deleteBank(entity.id);
          break;
        default:
          result = { success: false, error: "Unknown entity type" };
      }

      if (result.success) {
        toast.success(`${label.singular} deleted successfully`);
        setOpen(false);
      } else {
        toast.error(
          result.error ?? `Failed to delete ${label.singular.toLowerCase()}`
        );
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleBankNameChange(value: BankName): void {
    const selected = BANK_NAMES.find((b) => b.value === value);
    setFormData((prev) => ({
      ...prev,
      name: value,
      displayName: selected?.label ?? prev.displayName ?? "",
    }));
  }

  // ============================================================
  // RENDER FORM FIELDS
  // ============================================================

  function renderFormFields(): React.ReactNode {
    switch (entityType) {
      case "income":
        return renderIncomeFields();
      case "debt":
        return renderDebtFields();
      case "credit":
        return renderCreditFields();
      case "recurringExpense":
        return renderRecurringExpenseFields();
      case "oneTimeBill":
        return renderOneTimeBillFields();
      case "bank":
        return renderBankFields();
      default:
        return null;
    }
  }

  function renderIncomeFields(): React.ReactNode {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            value={formData.source ?? ""}
            onChange={(e) => updateField("source", e.target.value)}
            placeholder="e.g., Salary, Freelance"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount ?? ""}
              onChange={(e) => updateField("amount", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cycle">Cycle</Label>
            <Select
              value={formData.cycle ?? ""}
              onValueChange={(v) => updateField("cycle", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_CYCLES.map((cycle) => (
                  <SelectItem key={cycle} value={cycle}>
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextPaymentDate">Next Payment Date</Label>
          <Input
            id="nextPaymentDate"
            type="date"
            value={formData.nextPaymentDate ?? ""}
            onChange={(e) => updateField("nextPaymentDate", e.target.value)}
          />
        </div>
      </>
    );
  }

  function renderDebtFields(): React.ReactNode {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name ?? ""}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g., Car Loan, Credit Card"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Total Amount (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount ?? ""}
              onChange={(e) => updateField("amount", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remainingAmount">Remaining (€)</Label>
            <Input
              id="remainingAmount"
              type="number"
              step="0.01"
              value={formData.remainingAmount ?? ""}
              onChange={(e) => updateField("remainingAmount", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="payTo">Pay To</Label>
          <Input
            id="payTo"
            value={formData.payTo ?? ""}
            onChange={(e) => updateField("payTo", e.target.value)}
            placeholder="e.g., Bank, Company"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cycle">Payment Cycle</Label>
            <Select
              value={formData.cycle ?? ""}
              onValueChange={(v) => updateField("cycle", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_CYCLES.map((cycle) => (
                  <SelectItem key={cycle} value={cycle}>
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthsRemaining">Months Remaining</Label>
            <Input
              id="monthsRemaining"
              type="number"
              value={formData.monthsRemaining ?? ""}
              onChange={(e) => updateField("monthsRemaining", e.target.value)}
              placeholder="e.g., 12"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate ?? ""}
              onChange={(e) => updateField("dueDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMonth">Payment Month</Label>
            <Input
              id="paymentMonth"
              value={formData.paymentMonth ?? ""}
              onChange={(e) => updateField("paymentMonth", e.target.value)}
              placeholder="e.g., January 2025"
            />
          </div>
        </div>
      </>
    );
  }

  function renderCreditFields(): React.ReactNode {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Input
            id="provider"
            value={formData.provider ?? ""}
            onChange={(e) => updateField("provider", e.target.value)}
            placeholder="e.g., Klarna, PayPal Credit"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalLimit">Total Limit (€)</Label>
            <Input
              id="totalLimit"
              type="number"
              step="0.01"
              value={formData.totalLimit ?? ""}
              onChange={(e) => updateField("totalLimit", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usedAmount">Used Amount (€)</Label>
            <Input
              id="usedAmount"
              type="number"
              step="0.01"
              value={formData.usedAmount ?? ""}
              onChange={(e) => updateField("usedAmount", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              value={formData.interestRate ?? ""}
              onChange={(e) => updateField("interestRate", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate ?? ""}
              onChange={(e) => updateField("dueDate", e.target.value)}
            />
          </div>
        </div>
      </>
    );
  }

  function renderRecurringExpenseFields(): React.ReactNode {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name ?? ""}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g., Netflix, Gym Membership"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount ?? ""}
              onChange={(e) => updateField("amount", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cycle">Cycle</Label>
            <Select
              value={formData.cycle ?? ""}
              onValueChange={(v) => updateField("cycle", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRING_CYCLES.map((cycle) => (
                  <SelectItem key={cycle} value={cycle}>
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate ?? ""}
            onChange={(e) => updateField("dueDate", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="trialType">Trial Type</Label>
            <Select
              value={formData.trialType ?? ""}
              onValueChange={(v) => updateField("trialType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIAL_TYPES.map((trial) => (
                  <SelectItem key={trial} value={trial}>
                    {trial === "none"
                      ? "No Trial"
                      : trial === "week"
                      ? "7-Day Trial"
                      : trial === "month"
                      ? "30-Day Trial"
                      : "Custom Trial"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="trialEndDate">Trial End Date</Label>
            <Input
              id="trialEndDate"
              type="date"
              value={formData.trialEndDate ?? ""}
              onChange={(e) => updateField("trialEndDate", e.target.value)}
              disabled={formData.trialType === "none"}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category ?? ""}
            onValueChange={(v) => updateField("category", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {credits.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="linkedCreditId">Linked Credit (Optional)</Label>
            <Select
              value={formData.linkedCreditId || "none"}
              onValueChange={(v) =>
                updateField("linkedCreditId", v === "none" ? "" : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a credit..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {credits.map((credit) => (
                  <SelectItem key={credit.id} value={credit.id}>
                    {credit.provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {debts.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="linkedDebtId">Linked Debt (Optional)</Label>
            <Select
              value={formData.linkedDebtId || "none"}
              onValueChange={(v) =>
                updateField("linkedDebtId", v === "none" ? "" : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a debt..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {debts.map((debt) => (
                  <SelectItem key={debt.id} value={debt.id}>
                    {debt.name} - {debt.payTo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </>
    );
  }

  function renderOneTimeBillFields(): React.ReactNode {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name ?? ""}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g., Doctor Visit, Repair"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount ?? ""}
              onChange={(e) => updateField("amount", e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payTo">Pay To</Label>
            <Input
              id="payTo"
              value={formData.payTo ?? ""}
              onChange={(e) => updateField("payTo", e.target.value)}
              placeholder="e.g., Hospital, Shop"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate ?? ""}
              onChange={(e) => updateField("dueDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isPaid">Status</Label>
            <Select
              value={formData.isPaid ?? ""}
              onValueChange={(v) => updateField("isPaid", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Unpaid</SelectItem>
                <SelectItem value="true">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </>
    );
  }

  function renderBankFields(): React.ReactNode {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="name">Bank</Label>
          <Select
            value={formData.name ?? ""}
            onValueChange={(value) => handleBankNameChange(value as BankName)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BANK_NAMES.map((bank) => (
                <SelectItem key={bank.value} value={bank.value}>
                  {bank.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={formData.displayName ?? ""}
            onChange={(e) => updateField("displayName", e.target.value)}
            placeholder="e.g., My Volksbank Account"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="balance">Balance (€)</Label>
          <Input
            id="balance"
            type="number"
            step="0.01"
            value={formData.balance ?? ""}
            onChange={(e) => updateField("balance", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? `Add ${label.singular}`
              : `Edit ${label.singular}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormFields()}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes ?? ""}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Optional notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            {mode === "edit" && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="cursor-pointer"
              >
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="cursor-pointer">
              {loading ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
