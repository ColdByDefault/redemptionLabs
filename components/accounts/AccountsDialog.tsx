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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAccount,
  updateAccount,
  deleteAccount,
  createEmail,
  updateEmail,
  deleteEmail,
} from "@/actions/accounts-editor";
import type {
  Account,
  Email,
  AccountTier,
  BillingCycle,
  AuthMethod,
  EmailCategory,
} from "@/types/account";
import type { Bank } from "@/types/finance";

// ============================================================
// TYPES
// ============================================================

type EntityType = "account" | "email";
type EntityData = Account | Email;

interface AccountsDialogProps {
  entityType: EntityType;
  entity?: EntityData;
  trigger: React.ReactNode;
  mode: "create" | "edit";
  // For accounts - need emails for linking
  emails?: Email[];
  // For paid accounts - need banks for linking
  banks?: Bank[];
}

// ============================================================
// CONSTANTS
// ============================================================

const ACCOUNT_TIERS: AccountTier[] = ["free", "paid"];
const BILLING_CYCLES: BillingCycle[] = [
  "monthly",
  "yearly",
  "lifetime",
  "onetime",
];
const AUTH_METHODS: AuthMethod[] = [
  "none",
  "twofa",
  "passkey",
  "sms",
  "authenticator",
  "other",
];
const EMAIL_CATEGORIES: EmailCategory[] = ["primary", "secondary", "temp"];

const ENTITY_LABELS: Record<EntityType, { singular: string; plural: string }> =
  {
    account: { singular: "Account", plural: "Accounts" },
    email: { singular: "Email", plural: "Emails" },
  };

function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const parts = d.toISOString().split("T");
  return parts[0] ?? "";
}

// ============================================================
// COMPONENT
// ============================================================

export function AccountsDialog({
  entityType,
  entity,
  trigger,
  mode,
  emails = [],
  banks = [],
}: AccountsDialogProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedAuthMethods, setSelectedAuthMethods] = useState<AuthMethod[]>(
    []
  );

  const label = ENTITY_LABELS[entityType];

  // Helper to safely get form values with empty string fallback
  function getField(key: string): string {
    return formData[key] ?? "";
  }

  function updateField(key: string, value: string): void {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAuthMethod(method: AuthMethod): void {
    setSelectedAuthMethods((prev) => {
      if (method === "none") {
        // If selecting "none", clear all other selections
        return ["none"];
      }
      // Remove "none" if selecting another method
      const withoutNone = prev.filter((m) => m !== "none");
      if (withoutNone.includes(method)) {
        const result = withoutNone.filter((m) => m !== method);
        return result.length === 0 ? ["none"] : result;
      }
      return [...withoutNone, method];
    });
  }

  // Initialize form data based on entity type
  useEffect(() => {
    setFormData(getInitialFormData());
    // Initialize auth methods for accounts
    if (entityType === "account") {
      const account = entity as Account | undefined;
      setSelectedAuthMethods(account?.authMethods ?? ["none"]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, entityType]);

  function getInitialFormData(): Record<string, string> {
    switch (entityType) {
      case "account": {
        const account = entity as Account | undefined;
        return {
          provider: account?.provider ?? "",
          tier: account?.tier ?? "free",
          price: account?.price?.toString() ?? "",
          dueDate: formatDateForInput(account?.dueDate),
          billingCycle: account?.billingCycle ?? "",
          username: account?.username ?? "",
          password: account?.password ?? "",
          notes: account?.notes ?? "",
          emailId: account?.emailId ?? "",
          linkedBankId: account?.linkedBankId ?? "",
        };
      }
      case "email": {
        const email = entity as Email | undefined;
        return {
          email: email?.email ?? "",
          alias: email?.alias ?? "",
          category: email?.category ?? "primary",
          tier: email?.tier ?? "free",
          price: email?.price?.toString() ?? "",
          billingCycle: email?.billingCycle ?? "",
          password: email?.password ?? "",
          notes: email?.notes ?? "",
        };
      }
      default:
        return {};
    }
  }

  function resetForm(): void {
    setFormData(getInitialFormData());
    if (entityType === "account") {
      setSelectedAuthMethods(["none"]);
    }
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

        // Show additional toast if expense was auto-added
        if (
          mode === "create" &&
          "expenseAdded" in result &&
          result.expenseAdded
        ) {
          const expenseType =
            result.expenseAdded === "recurring"
              ? "recurring expenses"
              : "one-time bills";
          toast.info(`Added to ${expenseType} in Finance`, {
            description: "The paid subscription was automatically tracked.",
          });
        }

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
      case "account": {
        const emailId = getField("emailId");
        if (!emailId) {
          return { success: false, error: "Please select a linked email" };
        }
        const tier = getField("tier") as AccountTier;
        return createAccount({
          provider: getField("provider"),
          tier: tier,
          price: getField("price") ? parseFloat(getField("price")) : null,
          dueDate: getField("dueDate") ? new Date(getField("dueDate")) : null,
          billingCycle:
            getField("billingCycle") && getField("billingCycle") !== "none"
              ? (getField("billingCycle") as BillingCycle)
              : null,
          authMethods: selectedAuthMethods,
          username: getField("username") || null,
          password: getField("password") || null,
          notes: getField("notes") || null,
          emailId: emailId,
          linkedBankId:
            tier === "paid" && getField("linkedBankId")
              ? getField("linkedBankId")
              : null,
        });
      }
      case "email":
        return createEmail({
          email: getField("email"),
          alias: getField("alias").trim() || null,
          category: getField("category") as EmailCategory,
          tier: getField("tier") as AccountTier,
          price: getField("price") ? parseFloat(getField("price")) : null,
          billingCycle:
            getField("billingCycle") && getField("billingCycle") !== "none"
              ? (getField("billingCycle") as BillingCycle)
              : null,
          password: getField("password"),
          notes: getField("notes") || null,
        });
      default:
        return { success: false, error: "Unknown entity type" };
    }
  }

  async function handleUpdate(): Promise<{ success: boolean; error?: string }> {
    if (!entity) return { success: false, error: "No entity to update" };

    switch (entityType) {
      case "account": {
        const tier = getField("tier") as AccountTier;
        return updateAccount({
          id: entity.id,
          provider: getField("provider"),
          tier: tier,
          price: getField("price") ? parseFloat(getField("price")) : null,
          dueDate: getField("dueDate") ? new Date(getField("dueDate")) : null,
          billingCycle:
            getField("billingCycle") && getField("billingCycle") !== "none"
              ? (getField("billingCycle") as BillingCycle)
              : null,
          authMethods: selectedAuthMethods,
          username: getField("username") || null,
          password: getField("password") || null,
          notes: getField("notes") || null,
          emailId: getField("emailId"),
          linkedBankId:
            tier === "paid" && getField("linkedBankId")
              ? getField("linkedBankId")
              : null,
        });
      }
      case "email":
        return updateEmail({
          id: entity.id,
          email: getField("email"),
          alias: getField("alias").trim() || null,
          category: getField("category") as EmailCategory,
          tier: getField("tier") as AccountTier,
          price: getField("price") ? parseFloat(getField("price")) : null,
          billingCycle:
            getField("billingCycle") && getField("billingCycle") !== "none"
              ? (getField("billingCycle") as BillingCycle)
              : null,
          password: getField("password"),
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
        case "account":
          result = await deleteAccount(entity.id);
          break;
        case "email":
          result = await deleteEmail(entity.id);
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

  // ============================================================
  // RENDER FORM FIELDS
  // ============================================================

  function renderFormFields(): React.ReactNode {
    switch (entityType) {
      case "account":
        return renderAccountFields();
      case "email":
        return renderEmailFields();
      default:
        return null;
    }
  }

  function renderAccountFields(): React.ReactNode {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="provider">Provider / Service</Label>
          <Input
            id="provider"
            type="text"
            value={formData.provider ?? ""}
            onChange={(e) => updateField("provider", e.target.value)}
            placeholder="Netflix, Spotify, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailId">Linked Email</Label>
          <Select
            value={formData.emailId ?? ""}
            onValueChange={(value) => updateField("emailId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select email" />
            </SelectTrigger>
            <SelectContent>
              {emails.map((email) => (
                <SelectItem key={email.id} value={email.id}>
                  {email.alias
                    ? `${email.alias} - ${email.email}`
                    : email.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tier">Tier</Label>
            <Select
              value={formData.tier ?? ""}
              onValueChange={(value) => updateField("tier", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TIERS.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select
              value={formData.billingCycle ?? ""}
              onValueChange={(value) => updateField("billingCycle", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {BILLING_CYCLES.map((cycle) => (
                  <SelectItem key={cycle} value={cycle}>
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Auth Methods</Label>
          <div className="grid grid-cols-3 gap-2">
            {AUTH_METHODS.map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <Checkbox
                  id={`auth-${method}`}
                  checked={selectedAuthMethods.includes(method)}
                  onCheckedChange={() => toggleAuthMethod(method)}
                />
                <Label
                  htmlFor={`auth-${method}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {method === "twofa"
                    ? "2FA"
                    : method.charAt(0).toUpperCase() + method.slice(1)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {getField("tier") === "paid" && banks.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="linkedBankId">Linked Bank</Label>
            <Select
              value={formData.linkedBankId || "none"}
              onValueChange={(value) =>
                updateField("linkedBankId", value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price ?? ""}
              onChange={(e) => updateField("price", e.target.value)}
              placeholder="0.00"
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

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={formData.username ?? ""}
            onChange={(e) => updateField("username", e.target.value)}
            placeholder="Username (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="text"
            value={formData.password ?? ""}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Password (optional)"
          />
        </div>
      </>
    );
  }

  function renderEmailFields(): React.ReactNode {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email ?? ""}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alias">Alias (Quick Reference)</Label>
          <Input
            id="alias"
            type="text"
            value={formData.alias ?? ""}
            onChange={(e) => updateField("alias", e.target.value)}
            placeholder="e.g., Main, Work, Personal"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category ?? ""}
              onValueChange={(value) => updateField("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier">Tier</Label>
            <Select
              value={formData.tier ?? ""}
              onValueChange={(value) => updateField("tier", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TIERS.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price ?? ""}
              onChange={(e) => updateField("price", e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select
              value={formData.billingCycle ?? ""}
              onValueChange={(value) => updateField("billingCycle", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {BILLING_CYCLES.map((cycle) => (
                  <SelectItem key={cycle} value={cycle}>
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="text"
            value={formData.password ?? ""}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Password"
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
              ? `Add New ${label.singular}`
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

          <div className="flex justify-between pt-4">
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
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="cursor-pointer"
              >
                {loading ? "Saving..." : mode === "create" ? "Create" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
