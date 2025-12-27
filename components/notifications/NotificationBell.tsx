"use client";

import { useState, useOptimistic, useCallback, useTransition } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import type { Notification, NotificationAction } from "@/types/notification";
import {
  getNotificationIcon,
  getNotificationTitle,
  getNotificationColor,
  getNotificationBgColor,
  formatNotificationDate,
  notificationReducer,
} from "@/lib/notification";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/actions/notification";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ============================================================
// TYPES
// ============================================================

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
}

// ============================================================
// NOTIFICATION ITEM COMPONENT
// ============================================================

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  isPending,
}: NotificationItemProps): React.ReactElement {
  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);
  const bgColor = getNotificationBgColor(notification.type);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 border-b last:border-b-0 transition-all",
        notification.isRead ? "bg-background opacity-60" : bgColor,
        isPending && "opacity-50"
      )}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("text-xs font-medium", color)}>
            {getNotificationTitle(notification.type)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatNotificationDate(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm mt-0.5 line-clamp-2">{notification.message}</p>
      </div>
      <div className="flex items-center gap-1">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onMarkRead(notification.id)}
            disabled={isPending}
          >
            <Check className="h-3 w-3" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(notification.id)}
          disabled={isPending}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function NotificationBell({
  notifications: initialNotifications,
  unreadCount: initialUnreadCount,
}: NotificationBellProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Optimistic state for notifications
  const [optimisticNotifications, addOptimisticAction] = useOptimistic(
    initialNotifications,
    notificationReducer
  );

  // Calculate optimistic unread count
  const optimisticUnreadCount = optimisticNotifications.filter(
    (n) => !n.isRead
  ).length;

  // Handle mark as read with optimistic update
  const handleMarkRead = useCallback(
    (id: string): void => {
      startTransition(async () => {
        addOptimisticAction({ type: "mark_read", id });
        await markNotificationAsRead(id);
      });
    },
    [addOptimisticAction]
  );

  // Handle mark all as read with optimistic update
  const handleMarkAllRead = useCallback((): void => {
    startTransition(async () => {
      addOptimisticAction({ type: "mark_all_read" });
      await markAllNotificationsAsRead();
    });
  }, [addOptimisticAction]);

  // Handle delete with optimistic update
  const handleDelete = useCallback(
    (id: string): void => {
      startTransition(async () => {
        addOptimisticAction({ type: "delete", id });
        await deleteNotification(id);
      });
    },
    [addOptimisticAction]
  );

  // Handle delete all with optimistic update
  const handleDeleteAll = useCallback((): void => {
    startTransition(async () => {
      addOptimisticAction({ type: "delete_all" });
      await deleteAllNotifications();
    });
  }, [addOptimisticAction]);

  return (
    <div className="relative">
      {/* Bell Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={`Notifications${
                optimisticUnreadCount > 0
                  ? ` (${optimisticUnreadCount} unread)`
                  : ""
              }`}
            >
              <Bell className="h-[1.2rem] w-[1.2rem]" />
              {optimisticUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                  {optimisticUnreadCount > 99 ? "99+" : optimisticUnreadCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-md border bg-background shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-3">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-1">
                {optimisticUnreadCount > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleMarkAllRead}
                          disabled={isPending}
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mark all as read</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {optimisticNotifications.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={handleDeleteAll}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete all</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {optimisticNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                optimisticNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                    isPending={isPending}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {optimisticNotifications.length > 0 && (
              <div className="border-t p-2">
                <p className="text-xs text-center text-muted-foreground">
                  {optimisticNotifications.length} notification
                  {optimisticNotifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
