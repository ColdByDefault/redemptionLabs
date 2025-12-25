import type {
  Transaction,
  TransactionType,
  TransactionFrequency,
} from "@/types/finance";

export function getMonthlyAmount(
  amount: number,
  frequency: TransactionFrequency
): number {
  switch (frequency) {
    case "yearly":
      return amount / 12;
    case "monthly":
    case "one_time":
      return amount;
  }
}

export function getYearlyAmount(
  amount: number,
  frequency: TransactionFrequency
): number {
  switch (frequency) {
    case "monthly":
      return amount * 12;
    case "yearly":
    case "one_time":
      return amount;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getTransactionsByType(
  transactions: Transaction[],
  type: TransactionType
): Transaction[] {
  return transactions.filter((t) => t.type === type && t.isActive);
}

export function getTotalMonthlyIncome(transactions: Transaction[]): number {
  return getTransactionsByType(transactions, "income").reduce(
    (total, t) => total + getMonthlyAmount(t.amount, t.frequency),
    0
  );
}

export function getTotalMonthlyExpenses(transactions: Transaction[]): number {
  return getTransactionsByType(transactions, "expense").reduce(
    (total, t) => total + getMonthlyAmount(t.amount, t.frequency),
    0
  );
}

export function getTotalYearlyIncome(transactions: Transaction[]): number {
  return getTransactionsByType(transactions, "income").reduce(
    (total, t) => total + getYearlyAmount(t.amount, t.frequency),
    0
  );
}

export function getTotalYearlyExpenses(transactions: Transaction[]): number {
  return getTransactionsByType(transactions, "expense").reduce(
    (total, t) => total + getYearlyAmount(t.amount, t.frequency),
    0
  );
}

export function getMonthlyBalance(transactions: Transaction[]): number {
  return (
    getTotalMonthlyIncome(transactions) - getTotalMonthlyExpenses(transactions)
  );
}

export function getYearlyBalance(transactions: Transaction[]): number {
  return (
    getTotalYearlyIncome(transactions) - getTotalYearlyExpenses(transactions)
  );
}

export function getTypeVariant(
  type: TransactionType
): "default" | "secondary" | "destructive" | "outline" {
  return type === "income" ? "default" : "destructive";
}

export function getFrequencyVariant(
  frequency: TransactionFrequency
): "default" | "secondary" | "destructive" | "outline" {
  switch (frequency) {
    case "monthly":
      return "secondary";
    case "yearly":
      return "outline";
    case "one_time":
      return "default";
  }
}
