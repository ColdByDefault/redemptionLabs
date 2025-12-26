"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logDelete, logRestore, onlyDeleted } from "@/lib/audit";
import type {
  Income,
  Debt,
  Credit,
  RecurringExpense,
  OneTimeBill,
  Bank,
} from "@/types/finance";
import type { Email, Account } from "@/types/account";
import type { WishlistItem } from "@/types/wishlist";

// ============================================================
// SOFT DELETE ACTIONS
// ============================================================

export async function softDeleteIncome(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const income = await prisma.income.findUnique({ where: { id } });
    if (!income) return { success: false, error: "Income not found" };

    await prisma.income.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logDelete("income", id, income.source);
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to soft delete income:", error);
    return { success: false, error: "Failed to delete income" };
  }
}

export async function softDeleteDebt(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const debt = await prisma.debt.findUnique({ where: { id } });
    if (!debt) return { success: false, error: "Debt not found" };

    await prisma.debt.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logDelete("debt", id, debt.name);
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to soft delete debt:", error);
    return { success: false, error: "Failed to delete debt" };
  }
}

export async function softDeleteCredit(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const credit = await prisma.credit.findUnique({ where: { id } });
    if (!credit) return { success: false, error: "Credit not found" };

    await prisma.credit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logDelete("credit", id, credit.provider);
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to soft delete credit:", error);
    return { success: false, error: "Failed to delete credit" };
  }
}

export async function softDeleteRecurringExpense(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const expense = await prisma.recurringExpense.findUnique({ where: { id } });
    if (!expense)
      return { success: false, error: "Recurring expense not found" };

    await prisma.recurringExpense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logDelete("recurring_expense", id, expense.name);
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to soft delete recurring expense:", error);
    return { success: false, error: "Failed to delete recurring expense" };
  }
}

export async function softDeleteOneTimeBill(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const bill = await prisma.oneTimeBill.findUnique({ where: { id } });
    if (!bill) return { success: false, error: "One-time bill not found" };

    await prisma.oneTimeBill.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logDelete("one_time_bill", id, bill.name);
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to soft delete one-time bill:", error);
    return { success: false, error: "Failed to delete one-time bill" };
  }
}

export async function softDeleteBank(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const bank = await prisma.bank.findUnique({ where: { id } });
    if (!bank) return { success: false, error: "Bank not found" };

    await prisma.bank.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logDelete("bank", id, bank.displayName);
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to soft delete bank:", error);
    return { success: false, error: "Failed to delete bank" };
  }
}

export async function softDeleteEmail(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const email = await prisma.email.findUnique({ where: { id } });
    if (!email) return { success: false, error: "Email not found" };

    // Soft delete associated accounts
    await prisma.account.updateMany({
      where: { emailId: id },
      data: { deletedAt: new Date() },
    });

    // Soft delete associated recurring expenses
    await prisma.recurringExpense.updateMany({
      where: { notes: { contains: `Auto-added from email: ${email.email}` } },
      data: { deletedAt: new Date() },
    });

    // Soft delete associated one-time bills
    await prisma.oneTimeBill.updateMany({
      where: { notes: { contains: `Auto-added from email: ${email.email}` } },
      data: { deletedAt: new Date() },
    });

    await prisma.email.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logDelete("email", id, email.email);
    revalidatePath("/accounts");
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to soft delete email:", error);
    return { success: false, error: "Failed to delete email" };
  }
}

export async function softDeleteAccount(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const account = await prisma.account.findUnique({ where: { id } });
    if (!account) return { success: false, error: "Account not found" };

    // Soft delete associated recurring expenses
    await prisma.recurringExpense.updateMany({
      where: {
        notes: { contains: `Auto-added from account: ${account.provider}` },
      },
      data: { deletedAt: new Date() },
    });

    // Soft delete associated one-time bills
    await prisma.oneTimeBill.updateMany({
      where: {
        notes: { contains: `Auto-added from account: ${account.provider}` },
      },
      data: { deletedAt: new Date() },
    });

    await prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logDelete("account", id, account.provider);
    revalidatePath("/accounts");
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to soft delete account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}

export async function softDeleteWishlistItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const item = await prisma.wishlistItem.findUnique({ where: { id } });
    if (!item) return { success: false, error: "Wishlist item not found" };

    await prisma.wishlistItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await logDelete("wishlist_item", id, item.name);
    revalidatePath("/wishlist");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to soft delete wishlist item:", error);
    return { success: false, error: "Failed to delete wishlist item" };
  }
}

// ============================================================
// RESTORE ACTIONS
// ============================================================

export async function restoreIncome(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const income = await prisma.income.findUnique({ where: { id } });
    if (!income) return { success: false, error: "Income not found" };

    await prisma.income.update({
      where: { id },
      data: { deletedAt: null },
    });

    await logRestore("income", id, income.source);
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to restore income:", error);
    return { success: false, error: "Failed to restore income" };
  }
}

export async function restoreDebt(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const debt = await prisma.debt.findUnique({ where: { id } });
    if (!debt) return { success: false, error: "Debt not found" };

    await prisma.debt.update({
      where: { id },
      data: { deletedAt: null },
    });

    await logRestore("debt", id, debt.name);
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to restore debt:", error);
    return { success: false, error: "Failed to restore debt" };
  }
}

export async function restoreCredit(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const credit = await prisma.credit.findUnique({ where: { id } });
    if (!credit) return { success: false, error: "Credit not found" };

    await prisma.credit.update({
      where: { id },
      data: { deletedAt: null },
    });

    await logRestore("credit", id, credit.provider);
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to restore credit:", error);
    return { success: false, error: "Failed to restore credit" };
  }
}

export async function restoreRecurringExpense(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const expense = await prisma.recurringExpense.findUnique({ where: { id } });
    if (!expense)
      return { success: false, error: "Recurring expense not found" };

    await prisma.recurringExpense.update({
      where: { id },
      data: { deletedAt: null },
    });

    await logRestore("recurring_expense", id, expense.name);
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to restore recurring expense:", error);
    return { success: false, error: "Failed to restore recurring expense" };
  }
}

export async function restoreOneTimeBill(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const bill = await prisma.oneTimeBill.findUnique({ where: { id } });
    if (!bill) return { success: false, error: "One-time bill not found" };

    await prisma.oneTimeBill.update({
      where: { id },
      data: { deletedAt: null },
    });

    await logRestore("one_time_bill", id, bill.name);
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to restore one-time bill:", error);
    return { success: false, error: "Failed to restore one-time bill" };
  }
}

export async function restoreBank(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const bank = await prisma.bank.findUnique({ where: { id } });
    if (!bank) return { success: false, error: "Bank not found" };

    await prisma.bank.update({
      where: { id },
      data: { deletedAt: null },
    });

    await logRestore("bank", id, bank.displayName);
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to restore bank:", error);
    return { success: false, error: "Failed to restore bank" };
  }
}

export async function restoreEmail(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const email = await prisma.email.findUnique({ where: { id } });
    if (!email) return { success: false, error: "Email not found" };

    // Restore associated accounts
    await prisma.account.updateMany({
      where: { emailId: id, deletedAt: { not: null } },
      data: { deletedAt: null },
    });

    // Restore associated recurring expenses
    await prisma.recurringExpense.updateMany({
      where: {
        notes: { contains: `Auto-added from email: ${email.email}` },
        deletedAt: { not: null },
      },
      data: { deletedAt: null },
    });

    // Restore associated one-time bills
    await prisma.oneTimeBill.updateMany({
      where: {
        notes: { contains: `Auto-added from email: ${email.email}` },
        deletedAt: { not: null },
      },
      data: { deletedAt: null },
    });

    await prisma.email.update({
      where: { id },
      data: { deletedAt: null },
    });

    await logRestore("email", id, email.email);
    revalidatePath("/accounts");
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to restore email:", error);
    return { success: false, error: "Failed to restore email" };
  }
}

export async function restoreAccount(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const account = await prisma.account.findUnique({ where: { id } });
    if (!account) return { success: false, error: "Account not found" };

    // Restore associated recurring expenses
    await prisma.recurringExpense.updateMany({
      where: {
        notes: { contains: `Auto-added from account: ${account.provider}` },
        deletedAt: { not: null },
      },
      data: { deletedAt: null },
    });

    // Restore associated one-time bills
    await prisma.oneTimeBill.updateMany({
      where: {
        notes: { contains: `Auto-added from account: ${account.provider}` },
        deletedAt: { not: null },
      },
      data: { deletedAt: null },
    });

    await prisma.account.update({
      where: { id },
      data: { deletedAt: null },
    });

    await logRestore("account", id, account.provider);
    revalidatePath("/accounts");
    revalidatePath("/finance");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to restore account:", error);
    return { success: false, error: "Failed to restore account" };
  }
}

export async function restoreWishlistItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const item = await prisma.wishlistItem.findUnique({ where: { id } });
    if (!item) return { success: false, error: "Wishlist item not found" };

    await prisma.wishlistItem.update({
      where: { id },
      data: { deletedAt: null },
    });

    await logRestore("wishlist_item", id, item.name);
    revalidatePath("/wishlist");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to restore wishlist item:", error);
    return { success: false, error: "Failed to restore wishlist item" };
  }
}

// ============================================================
// PERMANENT DELETE ACTIONS
// ============================================================

export async function permanentDeleteIncome(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.income.delete({ where: { id } });
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to permanently delete income:", error);
    return { success: false, error: "Failed to permanently delete income" };
  }
}

export async function permanentDeleteDebt(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.debt.delete({ where: { id } });
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to permanently delete debt:", error);
    return { success: false, error: "Failed to permanently delete debt" };
  }
}

export async function permanentDeleteCredit(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.credit.delete({ where: { id } });
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to permanently delete credit:", error);
    return { success: false, error: "Failed to permanently delete credit" };
  }
}

export async function permanentDeleteRecurringExpense(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.recurringExpense.delete({ where: { id } });
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to permanently delete recurring expense:", error);
    return {
      success: false,
      error: "Failed to permanently delete recurring expense",
    };
  }
}

export async function permanentDeleteOneTimeBill(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.oneTimeBill.delete({ where: { id } });
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to permanently delete one-time bill:", error);
    return {
      success: false,
      error: "Failed to permanently delete one-time bill",
    };
  }
}

export async function permanentDeleteBank(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.bank.delete({ where: { id } });
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to permanently delete bank:", error);
    return { success: false, error: "Failed to permanently delete bank" };
  }
}

export async function permanentDeleteEmail(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Also permanently delete accounts associated with this email
    await prisma.account.deleteMany({ where: { emailId: id } });
    await prisma.email.delete({ where: { id } });
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to permanently delete email:", error);
    return { success: false, error: "Failed to permanently delete email" };
  }
}

export async function permanentDeleteAccount(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.account.delete({ where: { id } });
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to permanently delete account:", error);
    return { success: false, error: "Failed to permanently delete account" };
  }
}

export async function permanentDeleteWishlistItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.wishlistItem.delete({ where: { id } });
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to permanently delete wishlist item:", error);
    return {
      success: false,
      error: "Failed to permanently delete wishlist item",
    };
  }
}

// ============================================================
// FETCH DELETED ITEMS
// ============================================================

export interface DeletedItemsData {
  emails: Email[];
  accounts: Account[];
  incomes: Income[];
  debts: Debt[];
  credits: Credit[];
  recurringExpenses: RecurringExpense[];
  oneTimeBills: OneTimeBill[];
  banks: Bank[];
  wishlistItems: WishlistItem[];
}

export async function getDeletedItems(): Promise<DeletedItemsData> {
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
      where: onlyDeleted,
      orderBy: { deletedAt: "desc" },
    }),
    prisma.account.findMany({
      where: onlyDeleted,
      orderBy: { deletedAt: "desc" },
    }),
    prisma.income.findMany({
      where: onlyDeleted,
      orderBy: { deletedAt: "desc" },
    }),
    prisma.debt.findMany({
      where: onlyDeleted,
      orderBy: { deletedAt: "desc" },
    }),
    prisma.credit.findMany({
      where: onlyDeleted,
      orderBy: { deletedAt: "desc" },
    }),
    prisma.recurringExpense.findMany({
      where: onlyDeleted,
      orderBy: { deletedAt: "desc" },
    }),
    prisma.oneTimeBill.findMany({
      where: onlyDeleted,
      orderBy: { deletedAt: "desc" },
    }),
    prisma.bank.findMany({
      where: onlyDeleted,
      orderBy: { deletedAt: "desc" },
    }),
    prisma.wishlistItem.findMany({
      where: onlyDeleted,
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  return {
    emails: emails as Email[],
    accounts: accounts as Account[],
    incomes: incomes as Income[],
    debts: debts as Debt[],
    credits: credits as Credit[],
    recurringExpenses: recurringExpenses as RecurringExpense[],
    oneTimeBills: oneTimeBills as OneTimeBill[],
    banks: banks as Bank[],
    wishlistItems: wishlistItems as WishlistItem[],
  };
}

// ============================================================
// EMPTY TRASH
// ============================================================

export async function emptyTrash(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await Promise.all([
      prisma.account.deleteMany({ where: onlyDeleted }),
      prisma.email.deleteMany({ where: onlyDeleted }),
      prisma.income.deleteMany({ where: onlyDeleted }),
      prisma.debt.deleteMany({ where: onlyDeleted }),
      prisma.credit.deleteMany({ where: onlyDeleted }),
      prisma.recurringExpense.deleteMany({ where: onlyDeleted }),
      prisma.oneTimeBill.deleteMany({ where: onlyDeleted }),
      prisma.bank.deleteMany({ where: onlyDeleted }),
      prisma.wishlistItem.deleteMany({ where: onlyDeleted }),
    ]);
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to empty trash:", error);
    return { success: false, error: "Failed to empty trash" };
  }
}
