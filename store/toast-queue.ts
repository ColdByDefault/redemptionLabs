import { createNotification } from "@/actions/notification";
import type { NotificationType } from "@/types/notification";

// ============================================================
// TYPES
// ============================================================

type NotifyType = "success" | "error" | "info" | "warning";

interface NotifyOptions {
  /** Custom notification type override */
  notificationType?: NotificationType;
  /** Entity ID to link the notification to */
  entityId?: string;
  /** Description for additional context */
  description?: string;
}

// Map notify types to notification types
const notifyToNotificationType: Record<NotifyType, NotificationType> = {
  success: "success",
  error: "error",
  info: "info",
  warning: "warning",
};

// ============================================================
// NOTIFICATION API
// ============================================================

function sendNotification(
  type: NotifyType,
  message: string,
  options?: NotifyOptions
): void {
  const notifType = options?.notificationType ?? notifyToNotificationType[type];
  const fullMessage = options?.description
    ? `${message} - ${options.description}`
    : message;

  // Create notification (fire and forget)
  createNotification({
    type: notifType,
    message: fullMessage,
    entityId: options?.entityId ?? null,
  }).catch((err) => {
    console.error("Failed to create notification:", err);
  });
}

/**
 * Notification API - replaces toast system
 * All notifications are saved to the notification center
 */
export const queuedToast = {
  success: (message: string, options?: NotifyOptions): void => {
    sendNotification("success", message, options);
  },
  error: (message: string, options?: NotifyOptions): void => {
    sendNotification("error", message, options);
  },
  info: (message: string, options?: NotifyOptions): void => {
    sendNotification("info", message, options);
  },
  warning: (message: string, options?: NotifyOptions): void => {
    sendNotification("warning", message, options);
  },
  message: (message: string, options?: NotifyOptions): void => {
    sendNotification("info", message, options);
  },
};

/** Modern notification API alias */
export const notify = queuedToast;
