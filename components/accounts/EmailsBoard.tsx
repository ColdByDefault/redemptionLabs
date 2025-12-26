import type { EmailWithAccounts } from "@/types/account";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getEmailCategoryColor,
  getAccountTierColor,
  formatEmailCategory,
  formatBillingCycle,
  formatPrice,
} from "@/lib/account";

interface EmailsBoardProps {
  emails: EmailWithAccounts[];
}

export function EmailsBoard({ emails }: EmailsBoardProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Email Accounts</h2>
        <span className="text-sm text-muted-foreground">
          {emails.length} emails
        </span>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Billing</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Linked Accounts</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  No emails found
                </TableCell>
              </TableRow>
            ) : (
              emails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell className="font-medium">{email.email}</TableCell>
                  <TableCell>
                    <Badge className={getEmailCategoryColor(email.category)}>
                      {formatEmailCategory(email.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getAccountTierColor(email.tier)}>
                      {email.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(email.price)}</TableCell>
                  <TableCell>
                    {formatBillingCycle(email.billingCycle)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {email.password || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{email.accounts.length}</Badge>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {email.notes || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
