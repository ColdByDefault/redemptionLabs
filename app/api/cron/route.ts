import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getDaysUntilDue,
  isOverdue,
  isDueSoon,
  createBillDueMessage,
  createBillOverdueMessage,
  createRecurringCreatedMessage,
  buildNotificationMetadata,
  getNextMonthDate,
  getNextWeekDate,
  getNextYearDate,
} from "@/lib/notification";
import type {
  NotificationType,
  NotificationMetadata,
} from "@/types/notification";

// Cron secret for authorization (set in environment)
const CRON_SECRET = process.env.CRON_SECRET;

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
// TYPES
// ============================================================

interface CronResult {
  overdueBillsProcessed: number;
  dueSoonNotifications: number;
  recurringEntriesCreated: number;
  errors: string[];
}

interface NotificationToCreate {
  type: NotificationType;
  message: string;
  entityId: string | null;
  metadata: NotificationMetadata | null;
  userId: string;
}

// ============================================================
// MAIN CRON HANDLER
// ============================================================

export async function GET(request: Request): Promise<NextResponse> {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result: CronResult = {
    overdueBillsProcessed: 0,
    dueSoonNotifications: 0,
    recurringEntriesCreated: 0,
    errors: [],
  };

  try {
    // Run all cron tasks
    await Promise.all([
      processOverdueBills(result),
      processUpcomingBills(result),
      processRecurringExpenses(result),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: result,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        results: result,
      },
      { status: 500 }
    );
  }
}

// ============================================================
// PROCESS OVERDUE BILLS
// ============================================================

async function processOverdueBills(result: CronResult): Promise<void> {
  const notificationsToCreate: NotificationToCreate[] = [];

  try {
    // Get all unpaid one-time bills with due dates
    const oneTimeBills = await prisma.oneTimeBill.findMany({
      where: {
        deletedAt: null,
        isPaid: false,
        dueDate: { not: null },
      },
    });

    // Get all recurring expenses with due dates
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        deletedAt: null,
        dueDate: { not: null },
      },
    });

    // Check one-time bills for overdue
    for (const bill of oneTimeBills) {
      if (bill.dueDate && isOverdue(bill.dueDate)) {
        const daysOverdue = Math.abs(getDaysUntilDue(bill.dueDate) ?? 0);

        // Check if we already sent a notification today
        const hasRecent = await hasRecentNotificationForEntity(
          "bill_overdue",
          bill.id
        );
        if (!hasRecent) {
          notificationsToCreate.push({
            type: "bill_overdue",
            message: createBillOverdueMessage(
              bill.name,
              bill.amount,
              daysOverdue
            ),
            entityId: bill.id,
            metadata: buildNotificationMetadata({
              billId: bill.id,
              billName: bill.name,
              amount: bill.amount,
              dueDate: bill.dueDate,
            }),
            userId: bill.userId,
          });
          result.overdueBillsProcessed++;
        }
      }
    }

    // Check recurring expenses for overdue
    for (const expense of recurringExpenses) {
      if (expense.dueDate && isOverdue(expense.dueDate)) {
        const daysOverdue = Math.abs(getDaysUntilDue(expense.dueDate) ?? 0);

        const hasRecent = await hasRecentNotificationForEntity(
          "bill_overdue",
          expense.id
        );
        if (!hasRecent) {
          notificationsToCreate.push({
            type: "bill_overdue",
            message: createBillOverdueMessage(
              expense.name,
              expense.amount,
              daysOverdue
            ),
            entityId: expense.id,
            metadata: buildNotificationMetadata({
              billId: expense.id,
              billName: expense.name,
              amount: expense.amount,
              dueDate: expense.dueDate,
            }),
            userId: expense.userId,
          });
          result.overdueBillsProcessed++;
        }
      }
    }

    // Create all notifications in bulk
    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate.map((n) => ({
          type: n.type,
          message: n.message,
          entityId: n.entityId,
          metadata: toJsonValue(n.metadata),
          userId: n.userId,
        })),
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(`processOverdueBills: ${message}`);
  }
}

// ============================================================
// PROCESS UPCOMING BILLS (DUE SOON)
// ============================================================

async function processUpcomingBills(result: CronResult): Promise<void> {
  const notificationsToCreate: NotificationToCreate[] = [];
  const DAYS_BEFORE_DUE = 3; // Notify 3 days before due date

  try {
    // Get all unpaid one-time bills with due dates
    const oneTimeBills = await prisma.oneTimeBill.findMany({
      where: {
        deletedAt: null,
        isPaid: false,
        dueDate: { not: null },
      },
    });

    // Get all recurring expenses with due dates
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        deletedAt: null,
        dueDate: { not: null },
      },
    });

    // Check one-time bills for due soon
    for (const bill of oneTimeBills) {
      if (bill.dueDate && isDueSoon(bill.dueDate, DAYS_BEFORE_DUE)) {
        const daysUntilDue = getDaysUntilDue(bill.dueDate) ?? 0;

        const hasRecent = await hasRecentNotificationForEntity(
          "bill_due",
          bill.id
        );
        if (!hasRecent) {
          notificationsToCreate.push({
            type: "bill_due",
            message: createBillDueMessage(bill.name, bill.amount, daysUntilDue),
            entityId: bill.id,
            metadata: buildNotificationMetadata({
              billId: bill.id,
              billName: bill.name,
              amount: bill.amount,
              dueDate: bill.dueDate,
            }),
            userId: bill.userId,
          });
          result.dueSoonNotifications++;
        }
      }
    }

    // Check recurring expenses for due soon
    for (const expense of recurringExpenses) {
      if (expense.dueDate && isDueSoon(expense.dueDate, DAYS_BEFORE_DUE)) {
        const daysUntilDue = getDaysUntilDue(expense.dueDate) ?? 0;

        const hasRecent = await hasRecentNotificationForEntity(
          "bill_due",
          expense.id
        );
        if (!hasRecent) {
          notificationsToCreate.push({
            type: "bill_due",
            message: createBillDueMessage(
              expense.name,
              expense.amount,
              daysUntilDue
            ),
            entityId: expense.id,
            metadata: buildNotificationMetadata({
              billId: expense.id,
              billName: expense.name,
              amount: expense.amount,
              dueDate: expense.dueDate,
            }),
            userId: expense.userId,
          });
          result.dueSoonNotifications++;
        }
      }
    }

    // Create all notifications in bulk
    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate.map((n) => ({
          type: n.type,
          message: n.message,
          entityId: n.entityId,
          metadata: toJsonValue(n.metadata),
          userId: n.userId,
        })),
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(`processUpcomingBills: ${message}`);
  }
}

// ============================================================
// PROCESS RECURRING EXPENSES (AUTO-CREATE NEXT ENTRIES)
// ============================================================

async function processRecurringExpenses(result: CronResult): Promise<void> {
  const notificationsToCreate: NotificationToCreate[] = [];

  try {
    // Get all recurring expenses with past due dates
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        deletedAt: null,
        dueDate: { not: null },
      },
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (const expense of recurringExpenses) {
      if (!expense.dueDate) continue;

      const dueDate = new Date(expense.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      // Only process if due date has passed
      if (dueDate >= now) continue;

      // Calculate next due date based on cycle
      let nextDueDate: Date;
      switch (expense.cycle) {
        case "monthly":
          nextDueDate = getNextMonthDate(dueDate);
          break;
        case "weekly":
          nextDueDate = getNextWeekDate(dueDate);
          break;
        case "yearly":
          nextDueDate = getNextYearDate(dueDate);
          break;
        default:
          continue;
      }

      // Update the recurring expense with the new due date
      await prisma.recurringExpense.update({
        where: { id: expense.id },
        data: { dueDate: nextDueDate },
      });

      // Create notification for the new entry
      const monthStr = nextDueDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      notificationsToCreate.push({
        type: "recurring_created",
        message: createRecurringCreatedMessage(expense.name, monthStr),
        entityId: expense.id,
        metadata: buildNotificationMetadata({
          billId: expense.id,
          billName: expense.name,
          amount: expense.amount,
          dueDate: nextDueDate,
        }),
        userId: expense.userId,
      });

      result.recurringEntriesCreated++;
    }

    // Create all notifications in bulk
    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate.map((n) => ({
          type: n.type,
          message: n.message,
          entityId: n.entityId,
          metadata: toJsonValue(n.metadata),
          userId: n.userId,
        })),
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(`processRecurringExpenses: ${message}`);
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function hasRecentNotificationForEntity(
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

// ============================================================
// MANUAL TRIGGER (POST) - for testing
// ============================================================

export async function POST(request: Request): Promise<NextResponse> {
  // Use same authorization as GET
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Forward to GET handler
  return GET(request);
}
