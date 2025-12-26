import type {
  EmailCategory,
  AccountTier,
  BillingCycle,
  AuthMethod,
} from "@/types/account";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// Email category color classes
export function getEmailCategoryColor(category: EmailCategory): string {
  const colors: Record<EmailCategory, string> = {
    primary: "bg-green-500 text-white border-green-500",
    secondary: "bg-blue-500 text-white border-blue-500",
    temp: "bg-gray-500 text-white border-gray-500",
  };
  return colors[category];
}

// Account tier color classes
export function getAccountTierColor(tier: AccountTier): string {
  const colors: Record<AccountTier, string> = {
    free: "bg-emerald-500 text-white border-emerald-500",
    paid: "bg-red-500 text-white border-red-500",
  };
  return colors[tier];
}

// Billing cycle badge variants
export function getBillingCycleVariant(
  cycle: BillingCycle | null
): BadgeVariant {
  if (!cycle) return "outline";
  const variants: Record<BillingCycle, BadgeVariant> = {
    monthly: "secondary",
    yearly: "default",
    lifetime: "default",
    onetime: "outline",
  };
  return variants[cycle];
}

// Auth method badge variants
export function getAuthMethodVariant(method: AuthMethod): BadgeVariant {
  const variants: Record<AuthMethod, BadgeVariant> = {
    none: "outline",
    twofa: "default",
    passkey: "default",
    sms: "secondary",
    authenticator: "default",
    other: "secondary",
  };
  return variants[method];
}

// Format billing cycle for display
export function formatBillingCycle(cycle: BillingCycle | null): string {
  if (!cycle) return "-";
  const labels: Record<BillingCycle, string> = {
    monthly: "Monthly",
    yearly: "Yearly",
    lifetime: "Lifetime",
    onetime: "One-time",
  };
  return labels[cycle];
}

// Format auth method for display
export function formatAuthMethod(method: AuthMethod): string {
  const labels: Record<AuthMethod, string> = {
    none: "None",
    twofa: "2FA",
    passkey: "Passkey",
    sms: "SMS",
    authenticator: "Authenticator",
    other: "Other",
  };
  return labels[method];
}

// Format price for display
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "-";
  return `€${price.toFixed(2)}`;
}

// Format date for display
export function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

// Format email category for display
export function formatEmailCategory(category: EmailCategory): string {
  const labels: Record<EmailCategory, string> = {
    primary: "Primary",
    secondary: "Secondary",
    temp: "Temporary",
  };
  return labels[category];
}

// Linked accounts count color classes
export function getLinkedAccountsColor(count: number): string {
  if (count === 0) {
    return "bg-gray-500 text-white border-gray-500";
  }
  if (count <= 3) {
    return "bg-blue-500 text-white border-blue-500";
  }
  if (count <= 6) {
    return "bg-amber-500 text-white border-amber-500";
  }
  return "bg-red-500 text-white border-red-500";
}

// Format auth methods for display (multiple)
export function formatAuthMethods(methods: AuthMethod[]): string {
  if (methods.length === 0 || (methods.length === 1 && methods[0] === "none")) {
    return "None";
  }
  return methods
    .filter((m) => m !== "none")
    .map((method) => formatAuthMethod(method))
    .join(", ");
}
