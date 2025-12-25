import type { Subscription } from "@/types/subscription";
import {
  formatCurrency,
  formatDate,
  getDaysUntilDue,
  getMonthlyCost,
  getStatusVariant,
  getDueBadgeVariant,
} from "@/lib/subscriptions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SubscriptionTableProps {
  subscriptions: Subscription[];
}

export function SubscriptionTable({ subscriptions }: SubscriptionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Cycle</TableHead>
          <TableHead>Monthly</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((sub) => {
          const daysUntilDue = getDaysUntilDue(sub.nextDueDate);
          return (
            <TableRow key={sub.id}>
              <TableCell className="font-medium">{sub.name}</TableCell>
              <TableCell className="capitalize">{sub.category}</TableCell>
              <TableCell>{formatCurrency(sub.cost)}</TableCell>
              <TableCell className="capitalize">{sub.billingCycle}</TableCell>
              <TableCell>
                {formatCurrency(getMonthlyCost(sub.cost, sub.billingCycle))}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span>{formatDate(sub.nextDueDate)}</span>
                  <Badge variant={getDueBadgeVariant(daysUntilDue)}>
                    {daysUntilDue < 0
                      ? `${Math.abs(daysUntilDue)}d overdue`
                      : daysUntilDue === 0
                      ? "Due today"
                      : `${daysUntilDue}d left`}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(sub.status)}>
                  {sub.status}
                </Badge>
              </TableCell>
              <TableCell className="max-w-50 truncate">{sub.notes}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
