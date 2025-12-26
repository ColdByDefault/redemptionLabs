"use server";

import { prisma } from "@/lib/prisma";
import { notDeleted } from "@/lib/audit";
import type { EmailWithAccounts, AccountWithEmail } from "@/types/account";

export async function getEmailsWithAccounts(): Promise<EmailWithAccounts[]> {
  const emails = await prisma.email.findMany({
    where: notDeleted,
    include: {
      accounts: {
        where: notDeleted,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return emails;
}

export async function getAccountsWithEmail(): Promise<AccountWithEmail[]> {
  const accounts = await prisma.account.findMany({
    where: notDeleted,
    include: {
      email: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return accounts;
}
