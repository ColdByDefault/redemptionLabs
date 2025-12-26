import type { AccountWithEmail } from "@/types/account";
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
  getAccountTierColor,
  getBillingCycleVariant,
  getAuthMethodVariant,
  formatBillingCycle,
  formatAuthMethod,
  formatPrice,
  formatDate,
} from "@/lib/account";

interface SubsBoardProps {
  accounts: AccountWithEmail[];
}

export function SubsBoard({ accounts }: SubsBoardProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Subscriptions & Accounts</h2>
        <span className="text-sm text-muted-foreground">
          {accounts.length} accounts
        </span>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Billing</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Auth</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Linked Email</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center text-muted-foreground"
                >
                  No accounts found
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.provider}
                  </TableCell>
                  <TableCell>
                    <Badge className={getAccountTierColor(account.tier)}>
                      {account.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(account.price)}</TableCell>
                  <TableCell>
                    {account.billingCycle && (
                      <Badge
                        variant={getBillingCycleVariant(account.billingCycle)}
                      >
                        {formatBillingCycle(account.billingCycle)}
                      </Badge>
                    )}
                    {!account.billingCycle && "-"}
                  </TableCell>
                  <TableCell>{formatDate(account.dueDate)}</TableCell>
                  <TableCell>
                    <Badge variant={getAuthMethodVariant(account.authMethod)}>
                      {formatAuthMethod(account.authMethod)}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.username || "-"}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {account.password || "-"}
                  </TableCell>
                  <TableCell className="max-w-32 truncate">
                    {account.email.email}
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {account.notes || "-"}
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
