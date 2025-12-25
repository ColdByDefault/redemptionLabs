import { subscriptions } from "@/data/subscriptions";
import { SubscriptionTable } from "./SubscriptionTable";
import { SubscriptionSummary } from "./SubscriptionSummary";

export function Subscriptions() {
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
