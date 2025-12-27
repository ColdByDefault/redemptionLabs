"use client";

import { useEffect } from "react";
import { SectionCard } from "@/components/ui/section-card";
import { Button } from "@/components/ui/button";

export default function TrashError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    console.error("Trash page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trash</h1>
      </div>

      <SectionCard>
        <div className="py-8 text-center">
          <h2 className="text-xl font-semibold text-destructive">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mt-2">
            Failed to load deleted items
          </p>
          <Button onClick={reset} className="mt-4">
            Try again
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
