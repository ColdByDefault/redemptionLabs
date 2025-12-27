import type { UpcomingBill } from "@/types/finance";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface UpcomingBillsCardProps {
  bills: UpcomingBill[];
}

function getDueBadgeVariant(
  daysUntilDue: number
): "default" | "secondary" | "destructive" | "outline" {
  if (daysUntilDue === 0) return "destructive";
  if (daysUntilDue <= 2) return "default";
  return "secondary";
}

function formatDueLabel(daysUntilDue: number): string {
  if (daysUntilDue === 0) return "Today";
  if (daysUntilDue === 1) return "Tomorrow";
  return `In ${daysUntilDue} days`;
}

export function UpcomingBillsCard({
  bills,
}: UpcomingBillsCardProps): React.ReactElement {
  if (bills.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Upcoming Bills (7 days)
        </h3>
        <p className="text-sm text-muted-foreground">
          No upcoming bills in the next 7 days 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Upcoming Bills (7 days)
      </h3>
      <div className="space-y-2">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{bill.name}</span>
              <Badge variant="outline" className="text-xs">
                {bill.type === "recurring" ? "Recurring" : "One-time"}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">
                {formatCurrency(bill.amount)}
              </span>
              <Badge variant={getDueBadgeVariant(bill.daysUntilDue)}>
                {formatDueLabel(bill.daysUntilDue)}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
