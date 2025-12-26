"use client";

import { useState } from "react";
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
  createAccount,
  updateAccount,
  deleteAccount,
} from "@/actions/accounts-editor";
import type {
  Account,
  Email,
  AccountTier,
  BillingCycle,
  AuthMethod,
} from "@/types/account";

interface AccountDialogProps {
  account?: Account;
  emails: Email[];
  trigger: React.ReactNode;
  mode: "create" | "edit";
}

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

function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const parts = d.toISOString().split("T");
  return parts[0] ?? "";
}

export function AccountDialog({
  account,
  emails,
  trigger,
  mode,
}: AccountDialogProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    provider: account?.provider ?? "",
    tier: account?.tier ?? "free",
    price: account?.price?.toString() ?? "",
    dueDate: formatDateForInput(account?.dueDate),
    billingCycle: account?.billingCycle ?? "",
    authMethod: account?.authMethod ?? "none",
    username: account?.username ?? "",
    password: account?.password ?? "",
    notes: account?.notes ?? "",
    emailId: account?.emailId ?? "",
  });

  function resetForm(): void {
    setFormData({
      provider: account?.provider ?? "",
      tier: account?.tier ?? "free",
      price: account?.price?.toString() ?? "",
      dueDate: formatDateForInput(account?.dueDate),
      billingCycle: account?.billingCycle ?? "",
      authMethod: account?.authMethod ?? "none",
      username: account?.username ?? "",
      password: account?.password ?? "",
      notes: account?.notes ?? "",
      emailId: account?.emailId ?? "",
    });
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "create") {
        if (!formData.emailId) {
          toast.error("Please select a linked email");
          return;
        }

        const result = await createAccount({
          provider: formData.provider,
          tier: formData.tier as AccountTier,
          price: formData.price ? parseFloat(formData.price) : null,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
          billingCycle:
            formData.billingCycle && formData.billingCycle !== "none"
              ? (formData.billingCycle as BillingCycle)
              : null,
          authMethod: formData.authMethod as AuthMethod,
          username: formData.username || null,
          password: formData.password || null,
          notes: formData.notes || null,
          emailId: formData.emailId,
        });

        if (result.success) {
          toast.success("Account created successfully");
          setOpen(false);
          resetForm();
        } else {
          toast.error(result.error ?? "Failed to create account");
        }
      } else if (account) {
        const result = await updateAccount({
          id: account.id,
          provider: formData.provider,
          tier: formData.tier as AccountTier,
          price: formData.price ? parseFloat(formData.price) : null,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
          billingCycle:
            formData.billingCycle && formData.billingCycle !== "none"
              ? (formData.billingCycle as BillingCycle)
              : null,
          authMethod: formData.authMethod as AuthMethod,
          username: formData.username || null,
          password: formData.password || null,
          notes: formData.notes || null,
          emailId: formData.emailId,
        });

        if (result.success) {
          toast.success("Account updated successfully");
          setOpen(false);
        } else {
          toast.error(result.error ?? "Failed to update account");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!account) return;

    setLoading(true);
    try {
      const result = await deleteAccount(account.id);
      if (result.success) {
        toast.success("Account deleted successfully");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Failed to delete account");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Account" : "Edit Account"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider / Service</Label>
            <Input
              id="provider"
              type="text"
              value={formData.provider}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, provider: e.target.value }))
              }
              placeholder="Netflix, Spotify, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailId">Linked Email</Label>
            <Select
              value={formData.emailId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, emailId: value }))
              }
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
                value={formData.tier}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    tier: value as AccountTier,
                  }))
                }
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
              <Label htmlFor="authMethod">Auth Method</Label>
              <Select
                value={formData.authMethod}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    authMethod: value as AuthMethod,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select auth" />
                </SelectTrigger>
                <SelectContent>
                  {AUTH_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method === "twofa"
                        ? "2FA"
                        : method.charAt(0).toUpperCase() + method.slice(1)}
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
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <Select
                value={formData.billingCycle}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, billingCycle: value }))
                }
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
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="Username (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="text"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Password (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
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
