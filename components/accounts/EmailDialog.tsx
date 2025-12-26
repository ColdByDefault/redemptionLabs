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
  createEmail,
  updateEmail,
  deleteEmail,
} from "@/actions/accounts-editor";
import type {
  Email,
  EmailCategory,
  AccountTier,
  BillingCycle,
} from "@/types/account";

interface EmailDialogProps {
  email?: Email;
  trigger: React.ReactNode;
  mode: "create" | "edit";
}

const EMAIL_CATEGORIES: EmailCategory[] = ["primary", "secondary", "temp"];
const ACCOUNT_TIERS: AccountTier[] = ["free", "paid"];
const BILLING_CYCLES: BillingCycle[] = [
  "monthly",
  "yearly",
  "lifetime",
  "onetime",
];

export function EmailDialog({
  email,
  trigger,
  mode,
}: EmailDialogProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: email?.email ?? "",
    alias: email?.alias ?? "",
    category: email?.category ?? "primary",
    tier: email?.tier ?? "free",
    price: email?.price?.toString() ?? "",
    billingCycle: email?.billingCycle ?? "",
    password: email?.password ?? "",
    notes: email?.notes ?? "",
  });

  function resetForm(): void {
    setFormData({
      email: email?.email ?? "",
      alias: email?.alias ?? "",
      category: email?.category ?? "primary",
      tier: email?.tier ?? "free",
      price: email?.price?.toString() ?? "",
      billingCycle: email?.billingCycle ?? "",
      password: email?.password ?? "",
      notes: email?.notes ?? "",
    });
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "create") {
        const result = await createEmail({
          email: formData.email,
          alias: formData.alias.trim() || null,
          category: formData.category as EmailCategory,
          tier: formData.tier as AccountTier,
          price: formData.price ? parseFloat(formData.price) : null,
          billingCycle:
            formData.billingCycle && formData.billingCycle !== "none"
              ? (formData.billingCycle as BillingCycle)
              : null,
          password: formData.password,
          notes: formData.notes || null,
        });

        if (result.success) {
          toast.success("Email created successfully");
          setOpen(false);
          resetForm();
        } else {
          toast.error(result.error ?? "Failed to create email");
        }
      } else if (email) {
        const result = await updateEmail({
          id: email.id,
          email: formData.email,
          alias: formData.alias.trim() || null,
          category: formData.category as EmailCategory,
          tier: formData.tier as AccountTier,
          price: formData.price ? parseFloat(formData.price) : null,
          billingCycle:
            formData.billingCycle && formData.billingCycle !== "none"
              ? (formData.billingCycle as BillingCycle)
              : null,
          password: formData.password,
          notes: formData.notes || null,
        });

        if (result.success) {
          toast.success("Email updated successfully");
          setOpen(false);
        } else {
          toast.error(result.error ?? "Failed to update email");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!email) return;

    setLoading(true);
    try {
      const result = await deleteEmail(email.id);
      if (result.success) {
        toast.success("Email deleted successfully");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Failed to delete email");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Email" : "Edit Email"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alias">Alias (Quick Reference)</Label>
            <Input
              id="alias"
              type="text"
              value={formData.alias}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, alias: e.target.value }))
              }
              placeholder="e.g., Main, Work, Personal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: value as EmailCategory,
                  }))
                }
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="text"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Password"
              required
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
