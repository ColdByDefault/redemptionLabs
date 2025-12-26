import { cn } from "@/lib/utils";

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({
  children,
  className,
}: SectionCardProps): React.ReactElement {
  return (
    <section
      className={cn("rounded-xl border bg-muted/30 p-6 space-y-4", className)}
    >
      {children}
    </section>
  );
}
