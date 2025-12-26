"use client";

import { Pencil } from "lucide-react";
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
  getBillingCycleVariant,
  getLinkedAccountsColor,
  formatEmailCategory,
  formatBillingCycle,
  formatPrice,
} from "@/lib/account";
import { AccountsDialog } from "./AccountsDialog";
import { PasswordDialog } from "./PasswordDialog";

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
        <AccountsDialog
          entityType="email"
          mode="create"
          trigger={
            <Button size="sm" className="cursor-pointer">
              Add Email
            </Button>
          }
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
                    {email.alias ? <Badge>{email.alias}</Badge> : "-"}
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
                    {email.billingCycle ? (
                      <Badge
                        variant={getBillingCycleVariant(email.billingCycle)}
                      >
                        {formatBillingCycle(email.billingCycle)}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <PasswordDialog
                      password={email.password}
                      label="Email Password"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getLinkedAccountsColor(email.accounts.length)}
                    >
                      {email.accounts.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {email.notes || "-"}
                  </TableCell>
                  <TableCell>
                    <AccountsDialog
                      entityType="email"
                      mode="edit"
                      entity={email}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
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
