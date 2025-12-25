"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { navLinks } from "@/data/navbar";

export default function Home(): React.ReactElement {
  const { resolvedTheme } = useTheme();

  const backgroundImage = resolvedTheme === "light" ? "/bg2.png" : "/bg.jpg";

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="min-h-screen bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto flex min-h-screen flex-col items-center pt-32 gap-8 px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-white">
            Welcome to Redemption
          </h1>
          <p className="max-w-xl text-lg text-zinc-200">
            Your HomeLab management dashboard. Track your finances,
            subscriptions, and accounts all in one place.
          </p>
          <div className="flex gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md bg-white/90 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
