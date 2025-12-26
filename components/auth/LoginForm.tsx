"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/actions/auth";
import { toast } from "sonner";

export function LoginForm(): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const result = await loginAction(formData);

    if (result.success) {
      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
    } else {
      // Use field-level errors if available, otherwise show general error
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        setErrors(result.fieldErrors);
        toast.error("Please fix the errors below");
      } else {
        toast.error(result.error);
        setErrors({ form: result.error });
      }
    }

    setIsLoading(false);
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome back
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or Username</Label>
          <Input
            id="identifier"
            type="text"
            placeholder="you@example.com or username"
            value={formData.identifier}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, identifier: e.target.value }))
            }
            disabled={isLoading}
            required
            className={errors.identifier ? "border-red-500" : ""}
          />
          {errors.identifier && (
            <p className="text-xs text-red-500">{errors.identifier}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            disabled={isLoading}
            required
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {errors.form && <p className="text-sm text-red-500">{errors.form}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
