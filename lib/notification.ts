import type {
  NotificationType,
  Notification,
  NotificationMetadata,
  NotificationAction,
} from "@/types/notification";

// ============================================================
// NOTIFICATION TYPE HELPERS
// ============================================================

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    bill_due: "📅",
    bill_overdue: "⚠️",
    low_balance: "💰",
    recurring_created: "🔄",
    payment_reminder: "💳",
    item_created: "✨",
    item_updated: "✏️",
    item_deleted: "🗑️",
    item_restored: "♻️",
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };
  return icons[type];
}

export function getNotificationTitle(type: NotificationType): string {
  const titles: Record<NotificationType, string> = {
    bill_due: "Bill Due Soon",
    bill_overdue: "Bill Overdue",
    low_balance: "Low Balance Alert",
    recurring_created: "Recurring Entry Created",
    payment_reminder: "Payment Reminder",
    item_created: "Item Created",
    item_updated: "Item Updated",
    item_deleted: "Item Deleted",
    item_restored: "Item Restored",
    info: "Information",
    success: "Success",
    warning: "Warning",
    error: "Error",
  };
  return titles[type];
}

export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    bill_due: "text-yellow-500",
    bill_overdue: "text-red-500",
    low_balance: "text-orange-500",
    recurring_created: "text-blue-500",
    payment_reminder: "text-purple-500",
    item_created: "text-green-500",
    item_updated: "text-blue-500",
    item_deleted: "text-red-500",
    item_restored: "text-green-500",
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
  };
  return colors[type];
}

export function getNotificationBgColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    bill_due: "bg-yellow-500/10",
    bill_overdue: "bg-red-500/10",
    low_balance: "bg-orange-500/10",
    recurring_created: "bg-blue-500/10",
    payment_reminder: "bg-purple-500/10",
    item_created: "bg-green-500/10",
    item_updated: "bg-blue-500/10",
    item_deleted: "bg-red-500/10",
    item_restored: "bg-green-500/10",
    info: "bg-blue-500/10",
    success: "bg-green-500/10",
    warning: "bg-yellow-500/10",
    error: "bg-red-500/10",
  };
  return colors[type];
}

// ============================================================
// NOTIFICATION MESSAGE HELPERS
// ============================================================

export function createBillDueMessage(
  billName: string,
  amount: number,
  daysUntilDue: number
): string {
  const currency = formatNotificationCurrency(amount);
  if (daysUntilDue === 0) {
    return `${billName} (${currency}) is due today!`;
  }
  if (daysUntilDue === 1) {
    return `${billName} (${currency}) is due tomorrow.`;
  }
  return `${billName} (${currency}) is due in ${daysUntilDue} days.`;
}

export function createBillOverdueMessage(
  billName: string,
  amount: number,
  daysOverdue: number
): string {
  const currency = formatNotificationCurrency(amount);
  return `${billName} (${currency}) is ${daysOverdue} day${
    daysOverdue > 1 ? "s" : ""
  } overdue!`;
}

export function createLowBalanceMessage(
  bankName: string,
  balance: number,
  threshold: number
): string {
  const balanceStr = formatNotificationCurrency(balance);
  const thresholdStr = formatNotificationCurrency(threshold);
  return `${bankName} balance (${balanceStr}) is below ${thresholdStr}.`;
}

export function createRecurringCreatedMessage(
  expenseName: string,
  month: string
): string {
  return `New recurring entry created for ${expenseName} (${month}).`;
}

// ============================================================
// FORMAT HELPERS
// ============================================================

export function formatNotificationCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatNotificationDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  });
}

// ============================================================
// OPTIMISTIC REDUCER
// ============================================================

export function notificationReducer(
  state: Notification[],
  action: NotificationAction
): Notification[] {
  switch (action.type) {
    case "mark_read":
      return state.map((n) =>
        n.id === action.id ? { ...n, isRead: true } : n
      );
    case "mark_all_read":
      return state.map((n) => ({ ...n, isRead: true }));
    case "delete":
      return state.filter((n) => n.id !== action.id);
    case "add":
      return [action.notification, ...state];
    default:
      return state;
  }
}

// ============================================================
// CRON HELPERS
// ============================================================

export function getDaysUntilDue(dueDate: Date | null): number | null {
  if (!dueDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / 86400000);
}

export function isOverdue(dueDate: Date | null): boolean {
  if (!dueDate) return false;
  const days = getDaysUntilDue(dueDate);
  return days !== null && days < 0;
}

export function isDueSoon(
  dueDate: Date | null,
  withinDays: number = 3
): boolean {
  if (!dueDate) return false;
  const days = getDaysUntilDue(dueDate);
  return days !== null && days >= 0 && days <= withinDays;
}

export function getNextMonthDate(date: Date): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
}

export function getNextWeekDate(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 7);
  return next;
}

export function getNextYearDate(date: Date): Date {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + 1);
  return next;
}

export function buildNotificationMetadata(data: {
  billId?: string;
  billName?: string;
  amount?: number;
  dueDate?: Date | null;
  bankId?: string;
  bankName?: string;
  balance?: number;
  threshold?: number;
}): NotificationMetadata {
  return {
    ...(data.billId && { billId: data.billId }),
    ...(data.billName && { billName: data.billName }),
    ...(data.amount !== undefined && { amount: data.amount }),
    ...(data.dueDate && { dueDate: data.dueDate.toISOString() }),
    ...(data.bankId && { bankId: data.bankId }),
    ...(data.bankName && { bankName: data.bankName }),
    ...(data.balance !== undefined && { balance: data.balance }),
    ...(data.threshold !== undefined && { threshold: data.threshold }),
  };
}
