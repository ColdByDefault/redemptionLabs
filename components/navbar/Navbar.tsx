"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trash2, HardDrive } from "lucide-react";
import { navLinks } from "@/data/navbar";
import { ModeToggle } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";
import { NotificationBell } from "@/components/notifications";
import { BackupDialog } from "@/components/backup";

interface NavbarProps {
  notifications?: Notification[];
  unreadCount?: number;
}

export function Navbar({
  notifications = [],
  unreadCount = 0,
}: NavbarProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Redemption
          </Link>
          <div className="flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100",
                  pathname === link.href
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
          />
          <BackupDialog
            trigger={
              <Button variant="ghost" size="icon">
                <HardDrive className="h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400" />
                <span className="sr-only">Backup & Restore</span>
              </Button>
            }
          />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/trash">
              <Trash2
                className={cn(
                  "h-[1.2rem] w-[1.2rem]",
                  pathname === "/trash"
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400"
                )}
              />
              <span className="sr-only">Trash</span>
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
