"use client";

import { useState } from "react";
import { Eye, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PasswordDialogProps {
  password: string | null;
  label?: string;
}

export function PasswordDialog({
  password,
  label = "Password",
}: PasswordDialogProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  if (!password) {
    return <span className="text-muted-foreground">-</span>;
  }

  async function handleCopy(): Promise<void> {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success("Password copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy password");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto py-1 px-2 font-mono text-sm gap-1 cursor-pointer"
        >
          <span className="select-none">••</span>
          <Eye className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <code className="flex-1 font-mono text-sm break-all select-all">
              {password}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="shrink-0 cursor-pointer"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Click the password to select it, or use the copy button.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
