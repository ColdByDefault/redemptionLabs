"use client";

import { Button } from "@/components/ui/button";

interface DocumentsErrorProps {
  error: Error;
  reset: () => void;
}

export default function DocumentsError({
  error,
  reset,
}: DocumentsErrorProps): React.ReactElement {
  return (
    <div className="container mx-auto flex min-h-96 flex-col items-center justify-center px-4 py-8">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Something went wrong
      </h2>
      <p className="mt-2 text-zinc-500">{error.message}</p>
      <Button onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
