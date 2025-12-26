"use client";

import { formatRelativeTime } from "@/lib/finance";

interface SectionHeaderProps {
  title: string;
  updatedAt: Date | null;
}

export function SectionHeader({
  title,
  updatedAt,
}: SectionHeaderProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-1">
      <h2 className="text-xl font-semibold">{title}</h2>
      {updatedAt && (
        <span className="text-sm text-muted-foreground">
          Updated {formatRelativeTime(updatedAt)}
        </span>
      )}
    </div>
  );
}
