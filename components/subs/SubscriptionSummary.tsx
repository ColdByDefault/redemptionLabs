import type { Subscription } from "@/types/subscription";
import {
  formatCurrency,
  getTotalMonthlyCost,
  getTotalYearlyCost,
} from "@/lib/subscriptions";

interface SubscriptionSummaryProps {
  subscriptions: Subscription[];
}

export function SubscriptionSummary({
  subscriptions,
}: SubscriptionSummaryProps) {
  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const totalMonthly = getTotalMonthlyCost(subscriptions);
  const totalYearly = getTotalYearlyCost(subscriptions);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Active Subscriptions</p>
        <p className="text-2xl font-bold">{activeCount}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Monthly Cost</p>
        <p className="text-2xl font-bold">{formatCurrency(totalMonthly)}</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Yearly Cost</p>
        <p className="text-2xl font-bold">{formatCurrency(totalYearly)}</p>
      </div>
    </div>
  );
}
