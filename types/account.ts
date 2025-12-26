// Types for Email and Account models
// Mirrors Prisma schema enums and models

export type EmailCategory = "primary" | "secondary" | "temp";

export type AccountTier = "free" | "paid";

export type BillingCycle = "monthly" | "yearly" | "lifetime" | "onetime";

export type AuthMethod =
  | "none"
  | "twofa"
  | "passkey"
  | "sms"
  | "authenticator"
  | "other";

export interface Email {
  id: string;
  email: string;
  alias: string | null;
  category: EmailCategory;
  tier: AccountTier;
  price: number | null;
  billingCycle: BillingCycle | null;
  password: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  provider: string;
  tier: AccountTier;
  price: number | null;
  dueDate: Date | null;
  billingCycle: BillingCycle | null;
  authMethods: AuthMethod[];
  username: string | null;
  password: string | null;
  notes: string | null;
  emailId: string;
  linkedBankId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Extended types with relations
export interface EmailWithAccounts extends Email {
  accounts: Account[];
}

export interface AccountWithEmail extends Account {
  email: Email;
}
