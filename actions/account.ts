"use server";

import { prisma } from "@/lib/prisma";
import type { EmailWithAccounts, AccountWithEmail } from "@/types/account";

export async function getEmailsWithAccounts(): Promise<EmailWithAccounts[]> {
  const emails = await prisma.email.findMany({
    include: {
      accounts: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return emails;
}

export async function getAccountsWithEmail(): Promise<AccountWithEmail[]> {
  const accounts = await prisma.account.findMany({
    include: {
      email: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return accounts;
}
