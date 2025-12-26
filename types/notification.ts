// Types for Notification system
// Mirrors Prisma schema enums and models

// ============================================================
// ENUMS
// ============================================================

export type NotificationType =
  // Cron/automated notifications
  | "bill_due"
  | "bill_overdue"
  | "low_balance"
  | "recurring_created"
  | "payment_reminder"
  // CRUD operation notifications
  | "item_created"
  | "item_updated"
  | "item_deleted"
  | "item_restored"
  // Info notifications
  | "info"
  | "success"
  | "warning"
  | "error";

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  entityId: string | null;
  metadata: NotificationMetadata | null;
  createdAt: Date;
}

// ============================================================
// METADATA TYPES
// ============================================================

export interface NotificationMetadata {
  billId?: string;
  billName?: string;
  amount?: number;
  dueDate?: string;
  bankId?: string;
  bankName?: string;
  balance?: number;
  threshold?: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ============================================================
// OPTIMISTIC UPDATE TYPES
// ============================================================

export type NotificationAction =
  | { type: "mark_read"; id: string }
  | { type: "mark_all_read" }
  | { type: "delete"; id: string }
  | { type: "add"; notification: Notification };
