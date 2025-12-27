import type { NeedRate } from "@/types/wishlist";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// Need rate display labels
export function formatNeedRate(rate: NeedRate): string {
  const labels: Record<NeedRate, string> = {
    need: "Need",
    can_wait: "Can Wait",
    luxury: "Luxury",
  };
  return labels[rate];
}

// Need rate badge variants
export function getNeedRateVariant(rate: NeedRate): BadgeVariant {
  const variants: Record<NeedRate, BadgeVariant> = {
    need: "destructive",
    can_wait: "secondary",
    luxury: "outline",
  };
  return variants[rate];
}

// Need rate color classes for cards
export function getNeedRateColor(rate: NeedRate): string {
  const colors: Record<NeedRate, string> = {
    need: "border-l-red-500",
    can_wait: "border-l-yellow-500",
    luxury: "border-l-emerald-500",
  };
  return colors[rate];
}

// Format price for display
export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}

// Format date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

// Extract domain from URL for display
export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace("www.", "");
  } catch {
    return url;
  }
}

// Calculate total wishlist value
export function calculateTotalValue(items: Array<{ price: number }>): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Group items by need rate
export function groupByNeedRate<T extends { needRate: NeedRate }>(
  items: T[]
): Record<NeedRate, T[]> {
  return items.reduce(
    (groups, item) => {
      groups[item.needRate].push(item);
      return groups;
    },
    { need: [], can_wait: [], luxury: [] } as Record<NeedRate, T[]>
  );
}
