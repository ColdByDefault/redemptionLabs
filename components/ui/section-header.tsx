"use client";

import { formatRelativeTime } from "@/lib/finance";

interface SectionHeaderProps {
  title: string;
  updatedAt?: Date | null;
  subtitle?: string;
}

export function SectionHeader({
  title,
  updatedAt,
  subtitle,
}: SectionHeaderProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-1">
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle && (
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      )}
      {updatedAt && (
        <span className="text-sm text-muted-foreground">
          Updated {formatRelativeTime(updatedAt)}
        </span>
      )}
    </div>
  );
}
