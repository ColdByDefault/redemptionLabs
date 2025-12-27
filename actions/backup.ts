"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notDeleted } from "@/lib/audit";
import type {
  BackupData,
  BackupMetadata,
  BackupStats,
  RestoreResult,
  RestoreMode,
} from "@/types/backup";

const BACKUP_VERSION = "1.0.0";
const APP_NAME = "Redemption";

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

// ============================================================
// BACKUP ACTIONS
// ============================================================

export async function getBackupStats(): Promise<BackupStats> {
  const userId = await getAuthenticatedUserId();
  const [
    emailCount,
    accountCount,
    incomeCount,
    debtCount,
    creditCount,
    recurringExpenseCount,
    oneTimeBillCount,
    bankCount,
    wishlistItemCount,
  ] = await Promise.all([
    prisma.email.count({ where: { ...notDeleted, userId } }),
    prisma.account.count({ where: { ...notDeleted, userId } }),
    prisma.income.count({ where: { ...notDeleted, userId } }),
    prisma.debt.count({ where: { ...notDeleted, userId } }),
    prisma.credit.count({ where: { ...notDeleted, userId } }),
    prisma.recurringExpense.count({ where: { ...notDeleted, userId } }),
    prisma.oneTimeBill.count({ where: { ...notDeleted, userId } }),
    prisma.bank.count({ where: { ...notDeleted, userId } }),
    prisma.wishlistItem.count({ where: { ...notDeleted, userId } }),
  ]);

  const totalRecords =
    emailCount +
    accountCount +
    incomeCount +
    debtCount +
    creditCount +
    recurringExpenseCount +
    oneTimeBillCount +
    bankCount +
    wishlistItemCount;

  return {
    emails: emailCount,
    accounts: accountCount,
    incomes: incomeCount,
    debts: debtCount,
    credits: creditCount,
    recurringExpenses: recurringExpenseCount,
    oneTimeBills: oneTimeBillCount,
    banks: bankCount,
    wishlistItems: wishlistItemCount,
    totalRecords,
  };
}

export async function createBackup(): Promise<BackupData> {
  const userId = await getAuthenticatedUserId();
  const [
    emails,
    accounts,
    incomes,
    debts,
    credits,
    recurringExpenses,
    oneTimeBills,
    banks,
    wishlistItems,
  ] = await Promise.all([
    prisma.email.findMany({
      where: { ...notDeleted, userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.account.findMany({
      where: { ...notDeleted, userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.income.findMany({
      where: { ...notDeleted, userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.debt.findMany({
      where: { ...notDeleted, userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.credit.findMany({
      where: { ...notDeleted, userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.recurringExpense.findMany({
      where: { ...notDeleted, userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.oneTimeBill.findMany({
      where: { ...notDeleted, userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.bank.findMany({
      where: { ...notDeleted, userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.wishlistItem.findMany({
      where: { ...notDeleted, userId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalRecords =
    emails.length +
    accounts.length +
    incomes.length +
    debts.length +
    credits.length +
    recurringExpenses.length +
    oneTimeBills.length +
    banks.length +
    wishlistItems.length;

  const metadata: BackupMetadata = {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    appName: APP_NAME,
    totalRecords,
    userId,
  };

  return {
    metadata,
    data: {
      emails,
      accounts,
      incomes,
      debts,
      credits,
      recurringExpenses,
      oneTimeBills,
      banks,
      wishlistItems,
    },
  };
}

// ============================================================
// RESTORE ACTIONS
// ============================================================

export async function restoreBackup(
  backupJson: string,
  mode: RestoreMode
): Promise<RestoreResult> {
  try {
    const userId = await getAuthenticatedUserId();
    const backup: BackupData = JSON.parse(backupJson);

    // Validate backup structure
    if (!backup.metadata || !backup.data) {
      return {
        success: false,
        message: "Invalid backup file: missing metadata or data",
      };
    }

    if (backup.metadata.appName !== APP_NAME) {
      return {
        success: false,
        message: `Invalid backup file: expected ${APP_NAME} backup`,
      };
    }

    // Validate userId matches if present in backup
    if (backup.metadata.userId && backup.metadata.userId !== userId) {
      return {
        success: false,
        message:
          "This backup belongs to a different user and cannot be restored to your account",
      };
    }

    const { data } = backup;

    // If replace mode, clear existing data first (only for current user)
    if (mode === "replace") {
      await prisma.$transaction([
        prisma.account.deleteMany({ where: { userId } }),
        prisma.email.deleteMany({ where: { userId } }),
        prisma.recurringExpense.deleteMany({ where: { userId } }),
        prisma.oneTimeBill.deleteMany({ where: { userId } }),
        prisma.income.deleteMany({ where: { userId } }),
        prisma.debt.deleteMany({ where: { userId } }),
        prisma.credit.deleteMany({ where: { userId } }),
        prisma.bank.deleteMany({ where: { userId } }),
        prisma.wishlistItem.deleteMany({ where: { userId } }),
      ]);
    }

    // Restore data in correct order (banks first, then emails, then accounts)
    const stats = {
      emails: 0,
      accounts: 0,
      incomes: 0,
      debts: 0,
      credits: 0,
      recurringExpenses: 0,
      oneTimeBills: 0,
      banks: 0,
      wishlistItems: 0,
    };

    // Restore banks first (no dependencies)
    for (const bank of data.banks || []) {
      try {
        if (mode === "merge") {
          await prisma.bank.upsert({
            where: { id: bank.id },
            update: {
              name: bank.name,
              displayName: bank.displayName,
              balance: bank.balance,
              lastBalanceUpdate: new Date(bank.lastBalanceUpdate),
              notes: bank.notes,
              updatedAt: new Date(bank.updatedAt),
              deletedAt: bank.deletedAt ? new Date(bank.deletedAt) : null,
            },
            create: {
              id: bank.id,
              name: bank.name,
              displayName: bank.displayName,
              balance: bank.balance,
              lastBalanceUpdate: new Date(bank.lastBalanceUpdate),
              notes: bank.notes,
              userId,
              createdAt: new Date(bank.createdAt),
              updatedAt: new Date(bank.updatedAt),
              deletedAt: bank.deletedAt ? new Date(bank.deletedAt) : null,
            },
          });
        } else {
          await prisma.bank.create({
            data: {
              id: bank.id,
              name: bank.name,
              displayName: bank.displayName,
              balance: bank.balance,
              lastBalanceUpdate: new Date(bank.lastBalanceUpdate),
              notes: bank.notes,
              userId,
              createdAt: new Date(bank.createdAt),
              updatedAt: new Date(bank.updatedAt),
              deletedAt: bank.deletedAt ? new Date(bank.deletedAt) : null,
            },
          });
        }
        stats.banks++;
      } catch {
        // Skip duplicates in merge mode
      }
    }

    // Restore emails (accounts depend on emails)
    for (const email of data.emails || []) {
      try {
        if (mode === "merge") {
          await prisma.email.upsert({
            where: { id: email.id },
            update: {
              email: email.email,
              alias: email.alias,
              category: email.category,
              tier: email.tier,
              price: email.price,
              billingCycle: email.billingCycle,
              password: email.password,
              notes: email.notes,
              updatedAt: new Date(email.updatedAt),
              deletedAt: email.deletedAt ? new Date(email.deletedAt) : null,
            },
            create: {
              id: email.id,
              email: email.email,
              alias: email.alias,
              category: email.category,
              tier: email.tier,
              price: email.price,
              billingCycle: email.billingCycle,
              password: email.password,
              notes: email.notes,
              userId,
              createdAt: new Date(email.createdAt),
              updatedAt: new Date(email.updatedAt),
              deletedAt: email.deletedAt ? new Date(email.deletedAt) : null,
            },
          });
        } else {
          await prisma.email.create({
            data: {
              id: email.id,
              email: email.email,
              alias: email.alias,
              category: email.category,
              tier: email.tier,
              price: email.price,
              billingCycle: email.billingCycle,
              password: email.password,
              notes: email.notes,
              userId,
              createdAt: new Date(email.createdAt),
              updatedAt: new Date(email.updatedAt),
              deletedAt: email.deletedAt ? new Date(email.deletedAt) : null,
            },
          });
        }
        stats.emails++;
      } catch {
        // Skip duplicates in merge mode
      }
    }

    // Restore accounts (depends on emails)
    for (const account of data.accounts || []) {
      try {
        if (mode === "merge") {
          await prisma.account.upsert({
            where: { id: account.id },
            update: {
              provider: account.provider,
              tier: account.tier,
              price: account.price,
              dueDate: account.dueDate ? new Date(account.dueDate) : null,
              billingCycle: account.billingCycle,
              authMethods: account.authMethods,
              username: account.username,
              password: account.password,
              notes: account.notes,
              emailId: account.emailId,
              linkedBankId: account.linkedBankId,
              updatedAt: new Date(account.updatedAt),
              deletedAt: account.deletedAt ? new Date(account.deletedAt) : null,
            },
            create: {
              id: account.id,
              provider: account.provider,
              tier: account.tier,
              price: account.price,
              dueDate: account.dueDate ? new Date(account.dueDate) : null,
              billingCycle: account.billingCycle,
              authMethods: account.authMethods,
              username: account.username,
              password: account.password,
              notes: account.notes,
              emailId: account.emailId,
              linkedBankId: account.linkedBankId,
              userId,
              createdAt: new Date(account.createdAt),
              updatedAt: new Date(account.updatedAt),
              deletedAt: account.deletedAt ? new Date(account.deletedAt) : null,
            },
          });
        } else {
          await prisma.account.create({
            data: {
              id: account.id,
              provider: account.provider,
              tier: account.tier,
              price: account.price,
              dueDate: account.dueDate ? new Date(account.dueDate) : null,
              billingCycle: account.billingCycle,
              authMethods: account.authMethods,
              username: account.username,
              password: account.password,
              notes: account.notes,
              emailId: account.emailId,
              linkedBankId: account.linkedBankId,
              userId,
              createdAt: new Date(account.createdAt),
              updatedAt: new Date(account.updatedAt),
              deletedAt: account.deletedAt ? new Date(account.deletedAt) : null,
            },
          });
        }
        stats.accounts++;
      } catch {
        // Skip duplicates in merge mode
      }
    }

    // Restore incomes
    for (const income of data.incomes || []) {
      try {
        if (mode === "merge") {
          await prisma.income.upsert({
            where: { id: income.id },
            update: {
              source: income.source,
              amount: income.amount,
              cycle: income.cycle,
              nextPaymentDate: income.nextPaymentDate
                ? new Date(income.nextPaymentDate)
                : null,
              notes: income.notes,
              updatedAt: new Date(income.updatedAt),
              deletedAt: income.deletedAt ? new Date(income.deletedAt) : null,
            },
            create: {
              id: income.id,
              source: income.source,
              amount: income.amount,
              cycle: income.cycle,
              nextPaymentDate: income.nextPaymentDate
                ? new Date(income.nextPaymentDate)
                : null,
              notes: income.notes,
              userId,
              createdAt: new Date(income.createdAt),
              updatedAt: new Date(income.updatedAt),
              deletedAt: income.deletedAt ? new Date(income.deletedAt) : null,
            },
          });
        } else {
          await prisma.income.create({
            data: {
              id: income.id,
              source: income.source,
              amount: income.amount,
              cycle: income.cycle,
              nextPaymentDate: income.nextPaymentDate
                ? new Date(income.nextPaymentDate)
                : null,
              notes: income.notes,
              userId,
              createdAt: new Date(income.createdAt),
              updatedAt: new Date(income.updatedAt),
              deletedAt: income.deletedAt ? new Date(income.deletedAt) : null,
            },
          });
        }
        stats.incomes++;
      } catch {
        // Skip duplicates in merge mode
      }
    }

    // Restore debts
    for (const debt of data.debts || []) {
      try {
        if (mode === "merge") {
          await prisma.debt.upsert({
            where: { id: debt.id },
            update: {
              name: debt.name,
              amount: debt.amount,
              remainingAmount: debt.remainingAmount,
              payTo: debt.payTo,
              cycle: debt.cycle,
              paymentMonth: debt.paymentMonth,
              dueDate: debt.dueDate ? new Date(debt.dueDate) : null,
              monthsRemaining: debt.monthsRemaining,
              notes: debt.notes,
              updatedAt: new Date(debt.updatedAt),
              deletedAt: debt.deletedAt ? new Date(debt.deletedAt) : null,
            },
            create: {
              id: debt.id,
              name: debt.name,
              amount: debt.amount,
              remainingAmount: debt.remainingAmount,
              payTo: debt.payTo,
              cycle: debt.cycle,
              paymentMonth: debt.paymentMonth,
              dueDate: debt.dueDate ? new Date(debt.dueDate) : null,
              monthsRemaining: debt.monthsRemaining,
              notes: debt.notes,
              userId,
              createdAt: new Date(debt.createdAt),
              updatedAt: new Date(debt.updatedAt),
              deletedAt: debt.deletedAt ? new Date(debt.deletedAt) : null,
            },
          });
        } else {
          await prisma.debt.create({
            data: {
              id: debt.id,
              name: debt.name,
              amount: debt.amount,
              remainingAmount: debt.remainingAmount,
              payTo: debt.payTo,
              cycle: debt.cycle,
              paymentMonth: debt.paymentMonth,
              dueDate: debt.dueDate ? new Date(debt.dueDate) : null,
              monthsRemaining: debt.monthsRemaining,
              notes: debt.notes,
              userId,
              createdAt: new Date(debt.createdAt),
              updatedAt: new Date(debt.updatedAt),
              deletedAt: debt.deletedAt ? new Date(debt.deletedAt) : null,
            },
          });
        }
        stats.debts++;
      } catch {
        // Skip duplicates in merge mode
      }
    }

    // Restore credits
    for (const credit of data.credits || []) {
      try {
        if (mode === "merge") {
          await prisma.credit.upsert({
            where: { id: credit.id },
            update: {
              provider: credit.provider,
              totalLimit: credit.totalLimit,
              usedAmount: credit.usedAmount,
              interestRate: credit.interestRate,
              dueDate: credit.dueDate ? new Date(credit.dueDate) : null,
              notes: credit.notes,
              updatedAt: new Date(credit.updatedAt),
              deletedAt: credit.deletedAt ? new Date(credit.deletedAt) : null,
            },
            create: {
              id: credit.id,
              provider: credit.provider,
              totalLimit: credit.totalLimit,
              usedAmount: credit.usedAmount,
              interestRate: credit.interestRate,
              dueDate: credit.dueDate ? new Date(credit.dueDate) : null,
              notes: credit.notes,
              userId,
              createdAt: new Date(credit.createdAt),
              updatedAt: new Date(credit.updatedAt),
              deletedAt: credit.deletedAt ? new Date(credit.deletedAt) : null,
            },
          });
        } else {
          await prisma.credit.create({
            data: {
              id: credit.id,
              provider: credit.provider,
              totalLimit: credit.totalLimit,
              usedAmount: credit.usedAmount,
              interestRate: credit.interestRate,
              dueDate: credit.dueDate ? new Date(credit.dueDate) : null,
              notes: credit.notes,
              userId,
              createdAt: new Date(credit.createdAt),
              updatedAt: new Date(credit.updatedAt),
              deletedAt: credit.deletedAt ? new Date(credit.deletedAt) : null,
            },
          });
        }
        stats.credits++;
      } catch {
        // Skip duplicates in merge mode
      }
    }

    // Restore recurring expenses
    for (const expense of data.recurringExpenses || []) {
      try {
        if (mode === "merge") {
          await prisma.recurringExpense.upsert({
            where: { id: expense.id },
            update: {
              name: expense.name,
              amount: expense.amount,
              dueDate: expense.dueDate ? new Date(expense.dueDate) : null,
              cycle: expense.cycle,
              trialType: expense.trialType,
              trialEndDate: expense.trialEndDate
                ? new Date(expense.trialEndDate)
                : null,
              category: expense.category,
              linkedCreditId: expense.linkedCreditId,
              linkedDebtId: expense.linkedDebtId,
              linkedBankId: expense.linkedBankId,
              notes: expense.notes,
              updatedAt: new Date(expense.updatedAt),
              deletedAt: expense.deletedAt ? new Date(expense.deletedAt) : null,
            },
            create: {
              id: expense.id,
              name: expense.name,
              amount: expense.amount,
              dueDate: expense.dueDate ? new Date(expense.dueDate) : null,
              cycle: expense.cycle,
              trialType: expense.trialType,
              trialEndDate: expense.trialEndDate
                ? new Date(expense.trialEndDate)
                : null,
              category: expense.category,
              linkedCreditId: expense.linkedCreditId,
              linkedDebtId: expense.linkedDebtId,
              linkedBankId: expense.linkedBankId,
              notes: expense.notes,
              userId,
              createdAt: new Date(expense.createdAt),
              updatedAt: new Date(expense.updatedAt),
              deletedAt: expense.deletedAt ? new Date(expense.deletedAt) : null,
            },
          });
        } else {
          await prisma.recurringExpense.create({
            data: {
              id: expense.id,
              name: expense.name,
              amount: expense.amount,
              dueDate: expense.dueDate ? new Date(expense.dueDate) : null,
              cycle: expense.cycle,
              trialType: expense.trialType,
              trialEndDate: expense.trialEndDate
                ? new Date(expense.trialEndDate)
                : null,
              category: expense.category,
              linkedCreditId: expense.linkedCreditId,
              linkedDebtId: expense.linkedDebtId,
              linkedBankId: expense.linkedBankId,
              notes: expense.notes,
              userId,
              createdAt: new Date(expense.createdAt),
              updatedAt: new Date(expense.updatedAt),
              deletedAt: expense.deletedAt ? new Date(expense.deletedAt) : null,
            },
          });
        }
        stats.recurringExpenses++;
      } catch {
        // Skip duplicates in merge mode
      }
    }

    // Restore one-time bills
    for (const bill of data.oneTimeBills || []) {
      try {
        if (mode === "merge") {
          await prisma.oneTimeBill.upsert({
            where: { id: bill.id },
            update: {
              name: bill.name,
              amount: bill.amount,
              payTo: bill.payTo,
              dueDate: bill.dueDate ? new Date(bill.dueDate) : null,
              isPaid: bill.isPaid,
              linkedBankId: bill.linkedBankId,
              notes: bill.notes,
              updatedAt: new Date(bill.updatedAt),
              deletedAt: bill.deletedAt ? new Date(bill.deletedAt) : null,
            },
            create: {
              id: bill.id,
              name: bill.name,
              amount: bill.amount,
              payTo: bill.payTo,
              dueDate: bill.dueDate ? new Date(bill.dueDate) : null,
              isPaid: bill.isPaid,
              linkedBankId: bill.linkedBankId,
              notes: bill.notes,
              userId,
              createdAt: new Date(bill.createdAt),
              updatedAt: new Date(bill.updatedAt),
              deletedAt: bill.deletedAt ? new Date(bill.deletedAt) : null,
            },
          });
        } else {
          await prisma.oneTimeBill.create({
            data: {
              id: bill.id,
              name: bill.name,
              amount: bill.amount,
              payTo: bill.payTo,
              dueDate: bill.dueDate ? new Date(bill.dueDate) : null,
              isPaid: bill.isPaid,
              linkedBankId: bill.linkedBankId,
              notes: bill.notes,
              userId,
              createdAt: new Date(bill.createdAt),
              updatedAt: new Date(bill.updatedAt),
              deletedAt: bill.deletedAt ? new Date(bill.deletedAt) : null,
            },
          });
        }
        stats.oneTimeBills++;
      } catch {
        // Skip duplicates in merge mode
      }
    }

    // Restore wishlist items
    for (const item of data.wishlistItems || []) {
      try {
        if (mode === "merge") {
          await prisma.wishlistItem.upsert({
            where: { id: item.id },
            update: {
              name: item.name,
              price: item.price,
              whereToBuy: item.whereToBuy,
              needRate: item.needRate,
              reason: item.reason,
              links: item.links,
              imageUrl: item.imageUrl,
              updatedAt: new Date(item.updatedAt),
              deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
            },
            create: {
              id: item.id,
              name: item.name,
              price: item.price,
              whereToBuy: item.whereToBuy,
              needRate: item.needRate,
              reason: item.reason,
              links: item.links,
              imageUrl: item.imageUrl,
              userId,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
            },
          });
        } else {
          await prisma.wishlistItem.create({
            data: {
              id: item.id,
              name: item.name,
              price: item.price,
              whereToBuy: item.whereToBuy,
              needRate: item.needRate,
              reason: item.reason,
              links: item.links,
              imageUrl: item.imageUrl,
              userId,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
            },
          });
        }
        stats.wishlistItems++;
      } catch {
        // Skip duplicates in merge mode
      }
    }

    const totalRestored =
      stats.emails +
      stats.accounts +
      stats.incomes +
      stats.debts +
      stats.credits +
      stats.recurringExpenses +
      stats.oneTimeBills +
      stats.banks +
      stats.wishlistItems;

    return {
      success: true,
      message: `Successfully restored ${totalRestored} records`,
      stats,
    };
  } catch (error) {
    console.error("Restore error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to restore backup",
    };
  }
}

// ============================================================
// VALIDATION
// ============================================================

export async function validateBackupFile(backupJson: string): Promise<{
  valid: boolean;
  message: string;
  stats?: BackupStats;
  userId?: string;
}> {
  try {
    const backup: BackupData = JSON.parse(backupJson);

    if (!backup.metadata || !backup.data) {
      return { valid: false, message: "Invalid backup structure" };
    }

    if (backup.metadata.appName !== APP_NAME) {
      return {
        valid: false,
        message: `Invalid backup: expected ${APP_NAME} backup`,
      };
    }

    const { data } = backup;
    const stats: BackupStats = {
      emails: data.emails?.length || 0,
      accounts: data.accounts?.length || 0,
      incomes: data.incomes?.length || 0,
      debts: data.debts?.length || 0,
      credits: data.credits?.length || 0,
      recurringExpenses: data.recurringExpenses?.length || 0,
      oneTimeBills: data.oneTimeBills?.length || 0,
      banks: data.banks?.length || 0,
      wishlistItems: data.wishlistItems?.length || 0,
      totalRecords: 0,
    };

    stats.totalRecords =
      stats.emails +
      stats.accounts +
      stats.incomes +
      stats.debts +
      stats.credits +
      stats.recurringExpenses +
      stats.oneTimeBills +
      stats.banks +
      stats.wishlistItems;

    const result: {
      valid: boolean;
      message: string;
      stats?: BackupStats;
      userId?: string;
    } = {
      valid: true,
      message: `Valid backup from ${backup.metadata.createdAt}`,
      stats,
    };

    if (backup.metadata.userId) {
      result.userId = backup.metadata.userId;
    }

    return result;
  } catch {
    return { valid: false, message: "Invalid JSON format" };
  }
}
