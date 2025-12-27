"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  Notification,
  NotificationType,
  NotificationMetadata,
  NotificationResponse,
} from "@/types/notification";

// ============================================================
// HELPER: Get authenticated user ID
// ============================================================

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
}

async function getOptionalUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

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
  const userId = await getOptionalUserId();

  // Return empty response if not authenticated
  if (!userId) {
    return { notifications: [], unreadCount: 0 };
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  return {
    notifications: notifications as Notification[],
    unreadCount,
  };
}

export async function getUnreadCount(): Promise<number> {
  const userId = await getOptionalUserId();

  // Return 0 if not authenticated
  if (!userId) {
    return 0;
  }

  const count = await prisma.notification.count({
    where: { userId, isRead: false },
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
    const userId = await getAuthenticatedUserId();
    const notification = await prisma.notification.create({
      data: {
        type: input.type,
        message: input.message,
        entityId: input.entityId ?? null,
        metadata: toJsonValue(input.metadata),
        userId,
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
    const userId = await getAuthenticatedUserId();
    await prisma.notification.updateMany({
      where: { id, userId },
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
    const userId = await getAuthenticatedUserId();
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
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
    const userId = await getAuthenticatedUserId();
    await prisma.notification.deleteMany({
      where: { id, userId },
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
    const userId = await getAuthenticatedUserId();
    const result = await prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });
    revalidatePath("/");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to delete read notifications:", error);
    return { success: false, error: "Failed to delete read notifications" };
  }
}

export async function deleteAllNotifications(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const userId = await getAuthenticatedUserId();
    const result = await prisma.notification.deleteMany({
      where: { userId },
    });
    revalidatePath("/");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to delete all notifications:", error);
    return { success: false, error: "Failed to delete all notifications" };
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
    const userId = await getAuthenticatedUserId();
    const result = await prisma.notification.createMany({
      data: notifications.map((n) => ({
        type: n.type,
        message: n.message,
        entityId: n.entityId ?? null,
        metadata: toJsonValue(n.metadata),
        userId,
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
  const userId = await getAuthenticatedUserId();
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - withinHours);

  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type,
      entityId,
      createdAt: { gte: cutoff },
    },
  });

  return existing !== null;
}
