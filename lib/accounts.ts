import type { Account, AccountProvider } from "@/types/account";

export function getProviderLabel(provider: AccountProvider): string {
  switch (provider) {
    case "google":
      return "Google";
    case "icloud":
      return "iCloud";
    case "microsoft":
      return "Microsoft";
    case "github":
      return "GitHub";
  }
}

export function getProviderVariant(
  provider: AccountProvider
): "default" | "secondary" | "destructive" | "outline" {
  switch (provider) {
    case "google":
      return "default";
    case "icloud":
      return "secondary";
    case "microsoft":
      return "outline";
    case "github":
      return "outline";
  }
}

export function getTotalUsageCount(accounts: Account[]): number {
  return accounts.reduce((total, account) => total + account.usages.length, 0);
}

export function getAccountsByProvider(
  accounts: Account[],
  provider: AccountProvider
): Account[] {
  return accounts.filter((account) => account.provider === provider);
}

export function getPrimaryAccounts(accounts: Account[]): Account[] {
  return accounts.filter((account) => account.isPrimary);
}

export function getUniqueServices(accounts: Account[]): string[] {
  const services = new Set<string>();
  accounts.forEach((account) => {
    account.usages.forEach((usage) => {
      services.add(usage.service);
    });
  });
  return Array.from(services).sort();
}
