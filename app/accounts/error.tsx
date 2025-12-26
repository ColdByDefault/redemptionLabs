"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface AccountsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AccountsError({
  error,
  reset,
}: AccountsErrorProps): React.ReactElement {
  useEffect(() => {
    console.error("Accounts page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-destructive">
            Something went wrong
          </h2>
          <p className="text-muted-foreground max-w-md">
            Failed to load accounts data. This might be a temporary issue.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
