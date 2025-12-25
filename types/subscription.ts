export type BillingCycle = "monthly" | "yearly" | "weekly" | "one-time";

export type SubscriptionStatus = "active" | "cancelled" | "paused" | "trial";

export type SubscriptionCategory =
  | "streaming"
  | "software"
  | "gaming"
  | "cloud"
  | "productivity"
  | "other";

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  billingCycle: BillingCycle;
  nextDueDate: Date;
  status: SubscriptionStatus;
  category: SubscriptionCategory;
  notes: string;
}
