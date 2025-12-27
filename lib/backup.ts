// Backup utilities for formatting and calculations

import type { BackupStats } from "@/types/backup";

export function formatBackupFilename(): string {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
  return `redemption-backup-${date}_${time}.json`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getStatsSummary(stats: BackupStats): string[] {
  const summary: string[] = [];
  if (stats.emails > 0) summary.push(`${stats.emails} emails`);
  if (stats.accounts > 0) summary.push(`${stats.accounts} accounts`);
  if (stats.incomes > 0) summary.push(`${stats.incomes} incomes`);
  if (stats.debts > 0) summary.push(`${stats.debts} debts`);
  if (stats.credits > 0) summary.push(`${stats.credits} credits`);
  if (stats.recurringExpenses > 0)
    summary.push(`${stats.recurringExpenses} recurring expenses`);
  if (stats.oneTimeBills > 0)
    summary.push(`${stats.oneTimeBills} one-time bills`);
  if (stats.banks > 0) summary.push(`${stats.banks} banks`);
  if (stats.wishlistItems > 0)
    summary.push(`${stats.wishlistItems} wishlist items`);
  return summary;
}
