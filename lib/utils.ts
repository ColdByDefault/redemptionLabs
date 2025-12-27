import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================
// DATE FORMATTING
// ============================================================

/**
 * Format a date to a localized string
 */
export function formatDate(
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "—";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "Invalid date";

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "Invalid date";

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get relative time string (e.g., "in 3 days", "2 days ago")
 */
export function formatRelativeDate(
  date: Date | string | null | undefined
): string {
  if (!date) return "—";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid date";

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";

  if (diffDays > 0) {
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) return `In ${Math.round(diffDays / 7)} weeks`;
    return `In ${Math.round(diffDays / 30)} months`;
  }

  const absDays = Math.abs(diffDays);
  if (absDays < 7) return `${absDays} days ago`;
  if (absDays < 30) return `${Math.round(absDays / 7)} weeks ago`;
  return `${Math.round(absDays / 30)} months ago`;
}

/**
 * Check if a date is overdue
 */
export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return false;

  return d < new Date();
}

/**
 * Check if a date is due soon (within specified days)
 */
export function isDueSoon(
  date: Date | string | null | undefined,
  withinDays: number = 7
): boolean {
  if (!date) return false;

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return false;

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays > 0 && diffDays <= withinDays;
}

// ============================================================
// CURRENCY FORMATTING
// ============================================================

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = "EUR",
  locale: string = "de-DE"
): string {
  if (amount === null || amount === undefined) return "—";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as compact currency (e.g., €1.5K)
 */
export function formatCompactCurrency(
  amount: number | null | undefined,
  currency: string = "EUR",
  locale: string = "de-DE"
): string {
  if (amount === null || amount === undefined) return "—";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

// ============================================================
// STRING UTILITIES
// ============================================================

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
