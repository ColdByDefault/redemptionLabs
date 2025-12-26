import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  variant?: "default" | "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  variant = "default",
  icon,
}: SummaryCardProps): React.ReactElement {
  const variantStyles = {
    default: "bg-card border-border",
    positive: "bg-emerald-500/10 border-emerald-500/30",
    negative: "bg-red-500/10 border-red-500/30",
    neutral: "bg-muted/50 border-border",
  };

  const valueStyles = {
    default: "text-foreground",
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  };

  return (
    <div
      className={cn("rounded-xl border p-4 space-y-1", variantStyles[variant])}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p className={cn("text-2xl font-bold", valueStyles[variant])}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
