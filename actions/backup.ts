"use server";

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
// BACKUP ACTIONS
// ============================================================

export async function getBackupStats(): Promise<BackupStats> {
  const [
    emailCount,
    accountCount,
    incomeCount,
    debtCount,
    creditCount,
    recurringExpenseCount,
    oneTimeBillCount,
    bankCount,
  ] = await Promise.all([
    prisma.email.count({ where: notDeleted }),
    prisma.account.count({ where: notDeleted }),
    prisma.income.count({ where: notDeleted }),
    prisma.debt.count({ where: notDeleted }),
    prisma.credit.count({ where: notDeleted }),
    prisma.recurringExpense.count({ where: notDeleted }),
    prisma.oneTimeBill.count({ where: notDeleted }),
    prisma.bank.count({ where: notDeleted }),
  ]);

  const totalRecords =
    emailCount +
    accountCount +
    incomeCount +
    debtCount +
    creditCount +
    recurringExpenseCount +
    oneTimeBillCount +
    bankCount;

  return {
    emails: emailCount,
    accounts: accountCount,
    incomes: incomeCount,
    debts: debtCount,
    credits: creditCount,
    recurringExpenses: recurringExpenseCount,
    oneTimeBills: oneTimeBillCount,
    banks: bankCount,
    totalRecords,
  };
}

export async function createBackup(): Promise<BackupData> {
  const [
    emails,
    accounts,
    incomes,
    debts,
    credits,
    recurringExpenses,
    oneTimeBills,
    banks,
  ] = await Promise.all([
    prisma.email.findMany({ where: notDeleted, orderBy: { createdAt: "asc" } }),
    prisma.account.findMany({
      where: notDeleted,
      orderBy: { createdAt: "asc" },
    }),
    prisma.income.findMany({
      where: notDeleted,
      orderBy: { createdAt: "asc" },
    }),
    prisma.debt.findMany({ where: notDeleted, orderBy: { createdAt: "asc" } }),
    prisma.credit.findMany({
      where: notDeleted,
      orderBy: { createdAt: "asc" },
    }),
    prisma.recurringExpense.findMany({
      where: notDeleted,
      orderBy: { createdAt: "asc" },
    }),
    prisma.oneTimeBill.findMany({
      where: notDeleted,
      orderBy: { createdAt: "asc" },
    }),
    prisma.bank.findMany({ where: notDeleted, orderBy: { createdAt: "asc" } }),
  ]);

  const totalRecords =
    emails.length +
    accounts.length +
    incomes.length +
    debts.length +
    credits.length +
    recurringExpenses.length +
    oneTimeBills.length +
    banks.length;

  const metadata: BackupMetadata = {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    appName: APP_NAME,
    totalRecords,
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

    const { data } = backup;

    // If replace mode, clear existing data first
    if (mode === "replace") {
      await prisma.$transaction([
        prisma.account.deleteMany({}),
        prisma.email.deleteMany({}),
        prisma.recurringExpense.deleteMany({}),
        prisma.oneTimeBill.deleteMany({}),
        prisma.income.deleteMany({}),
        prisma.debt.deleteMany({}),
        prisma.credit.deleteMany({}),
        prisma.bank.deleteMany({}),
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

    const totalRestored =
      stats.emails +
      stats.accounts +
      stats.incomes +
      stats.debts +
      stats.credits +
      stats.recurringExpenses +
      stats.oneTimeBills +
      stats.banks;

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

export async function validateBackupFile(
  backupJson: string
): Promise<{ valid: boolean; message: string; stats?: BackupStats }> {
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
      stats.banks;

    return {
      valid: true,
      message: `Valid backup from ${backup.metadata.createdAt}`,
      stats,
    };
  } catch {
    return { valid: false, message: "Invalid JSON format" };
  }
}
