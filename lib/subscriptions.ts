import type {
  Subscription,
  BillingCycle,
  SubscriptionStatus,
} from "@/types/subscription";

const DAYS_IN_YEAR = 365;
const DAYS_IN_MONTH = 30;
const DAYS_IN_WEEK = 7;

export function getMonthlyCost(cost: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "yearly":
      return cost / 12;
    case "weekly":
      return cost * 4;
    case "monthly":
    case "one_time":
      return cost;
  }
}

export function getYearlyCost(cost: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "monthly":
      return cost * 12;
    case "weekly":
      return cost * 52;
    case "yearly":
    case "one_time":
      return cost;
  }
}

export function getDaysUntilDue(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function getTotalMonthlyCost(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((sub) => sub.status === "active")
    .reduce(
      (total, sub) => total + getMonthlyCost(sub.cost, sub.billingCycle),
      0
    );
}

export function getTotalYearlyCost(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((sub) => sub.status === "active")
    .reduce(
      (total, sub) => total + getYearlyCost(sub.cost, sub.billingCycle),
      0
    );
}

export function getUpcomingSubscriptions(
  subscriptions: Subscription[],
  withinDays: number = 7
): Subscription[] {
  return subscriptions.filter((sub) => {
    const days = getDaysUntilDue(sub.nextDueDate);
    return days >= 0 && days <= withinDays && sub.status === "active";
  });
}

export function getStatusVariant(
  status: SubscriptionStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "trial":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "paused":
      return "outline";
  }
}

export function getDueBadgeVariant(
  daysUntilDue: number
): "default" | "secondary" | "destructive" | "outline" {
  if (daysUntilDue < 0) return "destructive";
  if (daysUntilDue <= 3) return "destructive";
  if (daysUntilDue <= 7) return "secondary";
  return "outline";
}
