"use client";

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
import { Button } from "@/components/ui/button";
import {
  getEmailCategoryColor,
  getAccountTierColor,
  getEmailAliasColor,
  formatEmailCategory,
  formatBillingCycle,
  formatPrice,
} from "@/lib/account";
import { EmailDialog } from "./EmailDialog";

interface EmailsBoardProps {
  emails: EmailWithAccounts[];
}

export function EmailsBoard({ emails }: EmailsBoardProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Email Accounts</h2>
          <span className="text-sm text-muted-foreground">
            {emails.length} emails
          </span>
        </div>
        <EmailDialog
          mode="create"
          trigger={<Button size="sm">Add Email</Button>}
        />
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Alias</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Billing</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Linked Accounts</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
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
                    {email.alias ? (
                      <Badge className={getEmailAliasColor(email.alias)}>
                        {email.alias.charAt(0).toUpperCase() +
                          email.alias.slice(1)}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
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
                  <TableCell>
                    <EmailDialog
                      mode="edit"
                      email={email}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      }
                    />
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
