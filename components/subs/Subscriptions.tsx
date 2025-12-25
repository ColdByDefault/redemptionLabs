import { prisma } from "@/lib/prisma";
import { SubscriptionTable } from "./SubscriptionTable";
import { SubscriptionSummary } from "./SubscriptionSummary";
import type { Subscription } from "@/types/subscription";

export async function Subscriptions(): Promise<React.ReactElement> {
  const dbSubscriptions = await prisma.subscription.findMany({
    orderBy: { nextDueDate: "asc" },
  });

  const subscriptions: Subscription[] = dbSubscriptions.map((s) => ({
    id: s.id,
    name: s.name,
    cost: s.cost,
    billingCycle: s.billingCycle.replace(
      "_",
      "-"
    ) as Subscription["billingCycle"],
    nextDueDate: s.nextDueDate,
    status: s.status as Subscription["status"],
    category: s.category as Subscription["category"],
    notes: s.notes,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subscriptions</h2>
        <p className="text-muted-foreground">
          Track all your subscriptions and recurring payments.
        </p>
      </div>
      <SubscriptionSummary subscriptions={subscriptions} />
      <div className="rounded-lg border">
        <SubscriptionTable subscriptions={subscriptions} />
      </div>
    </div>
  );
}
