// Centralized constants for display names and labels
// Makes i18n easier by having all strings in one place

import type {
  EmailCategory,
  AccountTier,
  BillingCycle,
  AuthMethod,
} from "@/types/account";
import type {
  PaymentCycle,
  RecurringCycle,
  TrialType,
  ExpenseCategory,
  BankName,
  SectionName,
} from "@/types/finance";
import type { AuditAction, AuditEntity } from "@/types/audit";

// ============================================================
// EMAIL & ACCOUNT CONSTANTS
// ============================================================

export const EMAIL_CATEGORY_LABELS: Record<EmailCategory, string> = {
  primary: "Primary",
  secondary: "Secondary",
  temp: "Temporary",
} as const;

export const ACCOUNT_TIER_LABELS: Record<AccountTier, string> = {
  free: "Free",
  paid: "Paid",
} as const;

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  lifetime: "Lifetime",
  onetime: "One-time",
} as const;

export const AUTH_METHOD_LABELS: Record<AuthMethod, string> = {
  none: "None",
  twofa: "2FA",
  passkey: "Passkey",
  sms: "SMS",
  authenticator: "Authenticator",
  other: "Other",
} as const;

// ============================================================
// FINANCE CONSTANTS
// ============================================================

export const PAYMENT_CYCLE_LABELS: Record<PaymentCycle, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  weekly: "Weekly",
  onetime: "One-time",
} as const;

export const RECURRING_CYCLE_LABELS: Record<RecurringCycle, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  weekly: "Weekly",
} as const;

export const TRIAL_TYPE_LABELS: Record<TrialType, string> = {
  none: "No Trial",
  week: "1 Week",
  month: "1 Month",
  custom: "Custom",
} as const;

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  subscription: "Subscription",
  debt: "Debt",
} as const;

export const BANK_NAME_LABELS: Record<BankName, string> = {
  volksbank: "Volksbank",
  sparkasse: "Sparkasse",
  volksbank_visa: "Volksbank Visa",
  paypal: "PayPal",
} as const;

// ============================================================
// SECTION CONSTANTS
// ============================================================

export const SECTION_LABELS: Record<SectionName, string> = {
  emails: "Emails",
  accounts: "Accounts",
  banks: "Banks",
  income_overview: "Income Overview",
  recurring_expenses: "Recurring Expenses",
  one_time_bills: "One-Time Bills",
} as const;

// ============================================================
// BADGE VARIANT MAPPINGS
// ============================================================

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const EMAIL_CATEGORY_VARIANTS: Record<EmailCategory, BadgeVariant> = {
  primary: "default",
  secondary: "secondary",
  temp: "outline",
} as const;

export const ACCOUNT_TIER_VARIANTS: Record<AccountTier, BadgeVariant> = {
  free: "outline",
  paid: "default",
} as const;

export const EXPENSE_CATEGORY_VARIANTS: Record<ExpenseCategory, BadgeVariant> =
  {
    subscription: "default",
    debt: "destructive",
  } as const;

export const TRIAL_TYPE_VARIANTS: Record<TrialType, BadgeVariant> = {
  none: "outline",
  week: "secondary",
  month: "secondary",
  custom: "default",
} as const;

// ============================================================
// SELECT OPTIONS (for dropdowns)
// ============================================================

export const EMAIL_CATEGORY_OPTIONS = Object.entries(EMAIL_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const ACCOUNT_TIER_OPTIONS = Object.entries(ACCOUNT_TIER_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const BILLING_CYCLE_OPTIONS = Object.entries(BILLING_CYCLE_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const AUTH_METHOD_OPTIONS = Object.entries(AUTH_METHOD_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const PAYMENT_CYCLE_OPTIONS = Object.entries(PAYMENT_CYCLE_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const RECURRING_CYCLE_OPTIONS = Object.entries(
  RECURRING_CYCLE_LABELS
).map(([value, label]) => ({ value, label }));

export const TRIAL_TYPE_OPTIONS = Object.entries(TRIAL_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const EXPENSE_CATEGORY_OPTIONS = Object.entries(
  EXPENSE_CATEGORY_LABELS
).map(([value, label]) => ({ value, label }));

export const BANK_NAME_OPTIONS = Object.entries(BANK_NAME_LABELS).map(
  ([value, label]) => ({ value, label })
);

// ============================================================
// APP CONSTANTS
// ============================================================

export const APP_NAME = "Redemption";

export const DEFAULT_CURRENCY = "EUR";
export const DEFAULT_LOCALE = "de-DE";

export const PAGINATION_DEFAULT_PAGE_SIZE = 10;
export const PAGINATION_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// ============================================================
// AUDIT CONSTANTS
// ============================================================

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  restore: "Restored",
} as const;

export const AUDIT_ENTITY_LABELS: Record<AuditEntity, string> = {
  email: "Email",
  account: "Account",
  income: "Income",
  debt: "Debt",
  credit: "Credit",
  recurring_expense: "Recurring Expense",
  one_time_bill: "One-Time Bill",
  bank: "Bank",
  wishlist_item: "Wishlist Item",
} as const;

export type AuditBadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

export const AUDIT_ACTION_VARIANTS: Record<AuditAction, AuditBadgeVariant> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
  restore: "outline",
} as const;

export const AUDIT_ACTION_OPTIONS = Object.entries(AUDIT_ACTION_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const AUDIT_ENTITY_OPTIONS = Object.entries(AUDIT_ENTITY_LABELS).map(
  ([value, label]) => ({ value, label })
);
