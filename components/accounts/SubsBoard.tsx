"use client";

import { Pencil } from "lucide-react";
import type { AccountWithEmail, Email } from "@/types/account";
import type { Bank } from "@/types/finance";
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
  getAccountTierColor,
  getBillingCycleVariant,
  getAuthMethodVariant,
  formatBillingCycle,
  formatAuthMethods,
  formatPrice,
  formatDate,
} from "@/lib/account";
import { AccountsDialog } from "./AccountsDialog";
import { PasswordDialog } from "./PasswordDialog";

interface SubsBoardProps {
  accounts: AccountWithEmail[];
  emails: Email[];
  banks: Bank[];
}

export function SubsBoard({
  accounts,
  emails,
  banks,
}: SubsBoardProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Subscriptions & Accounts</h2>
          <span className="text-sm text-muted-foreground">
            {accounts.length} accounts
          </span>
        </div>
        <AccountsDialog
          entityType="account"
          mode="create"
          emails={emails}
          banks={banks}
          trigger={
            <Button size="sm" className="cursor-pointer">
              Add Account
            </Button>
          }
        />
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Billing</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Auth</TableHead>
              <TableHead>Linked Bank</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Linked Email</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
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
                    <div className="flex flex-wrap gap-1">
                      {account.authMethods.length === 0 ||
                      (account.authMethods.length === 1 &&
                        account.authMethods[0] === "none") ? (
                        <Badge variant="outline">None</Badge>
                      ) : (
                        account.authMethods
                          .filter((m) => m !== "none")
                          .map((method) => (
                            <Badge
                              key={method}
                              variant={getAuthMethodVariant(method)}
                            >
                              {method === "twofa"
                                ? "2FA"
                                : method.charAt(0).toUpperCase() +
                                  method.slice(1)}
                            </Badge>
                          ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {account.linkedBankId ? (
                      <Badge variant="secondary">
                        {banks.find((b) => b.id === account.linkedBankId)
                          ?.displayName ?? "Unknown"}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{account.username || "-"}</TableCell>
                  <TableCell>
                    <PasswordDialog
                      password={account.password}
                      label="Account Password"
                    />
                  </TableCell>
                  <TableCell>
                    {account.email.alias ? (
                      <Badge>{account.email.alias}</Badge>
                    ) : (
                      <span className="max-w-32 truncate block">
                        {account.email.email}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {account.notes || "-"}
                  </TableCell>
                  <TableCell>
                    <AccountsDialog
                      entityType="account"
                      mode="edit"
                      entity={account}
                      emails={emails}
                      banks={banks}
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
