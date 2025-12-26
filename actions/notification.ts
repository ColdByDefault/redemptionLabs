"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  Notification,
  NotificationType,
  NotificationMetadata,
  NotificationResponse,
} from "@/types/notification";

// Helper to convert null to Prisma.JsonNull for JSON fields
function toJsonValue(
  value: NotificationMetadata | null | undefined
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value === null || value === undefined) {
    return Prisma.JsonNull;
  }
  return value as Prisma.InputJsonValue;
}

// ============================================================
// FETCH ACTIONS
// ============================================================

export async function getNotifications(
  limit: number = 50
): Promise<NotificationResponse> {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const unreadCount = await prisma.notification.count({
    where: { isRead: false },
  });

  return {
    notifications: notifications as Notification[],
    unreadCount,
  };
}

export async function getUnreadCount(): Promise<number> {
  const count = await prisma.notification.count({
    where: { isRead: false },
  });
  return count;
}

// ============================================================
// MUTATION ACTIONS
// ============================================================

export async function createNotification(input: {
  type: NotificationType;
  message: string;
  entityId?: string | null;
  metadata?: NotificationMetadata | null;
}): Promise<{ success: boolean; notification?: Notification; error?: string }> {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: input.type,
        message: input.message,
        entityId: input.entityId ?? null,
        metadata: toJsonValue(input.metadata),
      },
    });
    revalidatePath("/");
    return { success: true, notification: notification as Notification };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

export async function markNotificationAsRead(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return {
      success: false,
      error: "Failed to mark all notifications as read",
    };
  }
}

export async function deleteNotification(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.notification.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function deleteAllReadNotifications(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const result = await prisma.notification.deleteMany({
      where: { isRead: true },
    });
    revalidatePath("/");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to delete read notifications:", error);
    return { success: false, error: "Failed to delete read notifications" };
  }
}

// ============================================================
// BULK NOTIFICATION CREATION (for cron jobs)
// ============================================================

export async function createBulkNotifications(
  notifications: Array<{
    type: NotificationType;
    message: string;
    entityId?: string | null;
    metadata?: NotificationMetadata | null;
  }>
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const result = await prisma.notification.createMany({
      data: notifications.map((n) => ({
        type: n.type,
        message: n.message,
        entityId: n.entityId ?? null,
        metadata: toJsonValue(n.metadata),
      })),
      skipDuplicates: true,
    });
    revalidatePath("/");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to create bulk notifications:", error);
    return { success: false, error: "Failed to create bulk notifications" };
  }
}

// ============================================================
// CHECK FOR EXISTING NOTIFICATION (to avoid duplicates)
// ============================================================

export async function hasRecentNotification(
  type: NotificationType,
  entityId: string,
  withinHours: number = 24
): Promise<boolean> {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - withinHours);

  const existing = await prisma.notification.findFirst({
    where: {
      type,
      entityId,
      createdAt: { gte: cutoff },
    },
  });

  return existing !== null;
}
