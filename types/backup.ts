// Types for Database Backup & Restore
// Used for exporting and importing all application data

import type { Email, Account } from "@/types/account";
import type {
  Income,
  Debt,
  Credit,
  RecurringExpense,
  OneTimeBill,
  Bank,
} from "@/types/finance";
import type { WishlistItem } from "@/types/wishlist";

// ============================================================
// BACKUP DATA TYPES
// ============================================================

export interface BackupMetadata {
  version: string;
  createdAt: string;
  appName: string;
  totalRecords: number;
  userId?: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: {
    emails: Email[];
    accounts: Account[];
    incomes: Income[];
    debts: Debt[];
    credits: Credit[];
    recurringExpenses: RecurringExpense[];
    oneTimeBills: OneTimeBill[];
    banks: Bank[];
    wishlistItems: WishlistItem[];
  };
}

// ============================================================
// RESTORE TYPES
// ============================================================

export type RestoreMode = "merge" | "replace";

export interface RestoreResult {
  success: boolean;
  message: string;
  stats?: {
    emails: number;
    accounts: number;
    incomes: number;
    debts: number;
    credits: number;
    recurringExpenses: number;
    oneTimeBills: number;
    banks: number;
    wishlistItems: number;
  };
}

export interface BackupStats {
  emails: number;
  accounts: number;
  incomes: number;
  debts: number;
  credits: number;
  recurringExpenses: number;
  oneTimeBills: number;
  banks: number;
  wishlistItems: number;
  totalRecords: number;
}
