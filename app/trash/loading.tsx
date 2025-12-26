import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "@/components/ui/section-card";
import { SectionHeader } from "@/components/ui/section-header";

export default function TrashLoading(): React.ReactElement {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-64 mt-1" />
      </div>

      <SectionCard>
        <SectionHeader title="Trash" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
