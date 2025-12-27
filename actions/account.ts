"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notDeleted } from "@/lib/audit";
import type { EmailWithAccounts, AccountWithEmail } from "@/types/account";

// ============================================================
// HELPER: Get authenticated user ID
// ============================================================

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
}

export async function getEmailsWithAccounts(): Promise<EmailWithAccounts[]> {
  const userId = await getAuthenticatedUserId();
  const emails = await prisma.email.findMany({
    where: { ...notDeleted, userId },
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
  const userId = await getAuthenticatedUserId();
  const accounts = await prisma.account.findMany({
    where: { ...notDeleted, userId },
    include: {
      email: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return accounts;
}
