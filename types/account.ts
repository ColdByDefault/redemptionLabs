export type AccountProvider = "google" | "icloud" | "microsoft" | "github";

export type AccountUsageCategory =
  | "email"
  | "storage"
  | "authentication"
  | "education"
  | "backup"
  | "development"
  | "social"
  | "work"
  | "personal"
  | "other";

export interface AccountUsage {
  service: string;
  category: AccountUsageCategory;
  description: string;
}

export interface Account {
  id: string;
  email: string;
  provider: AccountProvider;
  label: string;
  isPrimary: boolean;
  usages: AccountUsage[];
  notes: string;
}
