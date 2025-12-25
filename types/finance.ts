export type TransactionType = "income" | "expense";

export type TransactionFrequency = "monthly" | "yearly" | "one_time";

export type TransactionCategory =
  | "salary"
  | "freelance"
  | "investment"
  | "rent"
  | "utilities"
  | "insurance"
  | "food"
  | "transport"
  | "entertainment"
  | "healthcare"
  | "education"
  | "shopping"
  | "other";

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  frequency: TransactionFrequency;
  category: TransactionCategory;
  dueDay: number;
  isActive: boolean;
  notes: string;
}
