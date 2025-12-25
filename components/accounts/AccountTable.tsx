import type { Account } from "@/types/account";
import { getProviderLabel, getProviderVariant } from "@/lib/accounts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AccountTableProps {
  accounts: Account[];
}

export function AccountTable({ accounts }: AccountTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Label</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Primary</TableHead>
          <TableHead>Used For</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account.id}>
            <TableCell className="font-medium">{account.label}</TableCell>
            <TableCell>{account.email}</TableCell>
            <TableCell>
              <Badge variant={getProviderVariant(account.provider)}>
                {getProviderLabel(account.provider)}
              </Badge>
            </TableCell>
            <TableCell>
              {account.isPrimary ? (
                <Badge variant="default">Primary</Badge>
              ) : (
                <Badge variant="outline">Secondary</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {account.usages.map((usage) => (
                  <Badge key={usage.service} variant="secondary">
                    {usage.service}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="max-w-50 truncate">{account.notes}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
