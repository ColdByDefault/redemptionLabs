"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trash2, HardDrive, LogIn, Store } from "lucide-react";
import { navLinks } from "@/data/navbar";
import { ModeToggle } from "@/components/theme";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";
import type { Plugin } from "@/types/plugin";
import { NotificationBell } from "@/components/notifications";
import { BackupDialog } from "@/components/backup";
import { UserMenu } from "@/components/auth";

interface NavbarProps {
  notifications?: Notification[];
  unreadCount?: number;
  user?: {
    id: string;
    name: string;
    email: string;
    enabledPlugins: string[];
  } | null;
  enabledPlugins?: Plugin[];
}

export function Navbar({
  notifications = [],
  unreadCount = 0,
  user = null,
  enabledPlugins = [],
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
            {/* Core navigation links */}
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
            {/* Dynamic plugin links */}
            {enabledPlugins.map((plugin) => (
              <Link
                key={plugin.route}
                href={plugin.route}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100",
                  pathname === plugin.route
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                {plugin.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
              />
              <TooltipProvider>
                <Tooltip>
                  <BackupDialog
                    trigger={
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                        >
                          <HardDrive className="h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400" />
                          <span className="sr-only">Backup & Restore</span>
                        </Button>
                      </TooltipTrigger>
                    }
                  />
                  <TooltipContent>
                    <p>Backup & Restore</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Trash</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href="/marketplace">
                        <Store
                          className={cn(
                            "h-[1.2rem] w-[1.2rem]",
                            pathname === "/marketplace"
                              ? "text-zinc-900 dark:text-zinc-100"
                              : "text-zinc-500 dark:text-zinc-400"
                          )}
                        />
                        <span className="sr-only">Marketplace</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Marketplace</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <UserMenu username={user.name} email={user.email} />
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Link>
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
