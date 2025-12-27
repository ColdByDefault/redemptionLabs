import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AuditAction,
  AuditEntity,
  AuditChanges,
  AuditMetadata,
  AuditLog,
  CreateAuditLogInput,
  FieldChange,
} from "@/types/audit";

// ============================================================
// AUDIT LOG CREATION
// ============================================================

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  input: CreateAuditLogInput
): Promise<AuditLog> {
  const log = await prisma.auditLog.create({
    data: {
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      entityName: input.entityName ?? null,
      changes: input.changes
        ? (input.changes as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      metadata: input.metadata
        ? (input.metadata as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      userId: input.userId,
    },
  });

  return log as AuditLog;
}

/**
 * Log a create action
 */
export async function logCreate(
  entity: AuditEntity,
  entityId: string,
  entityName?: string,
  userId?: string,
  metadata?: AuditMetadata
): Promise<AuditLog | null> {
  if (!userId) return null;
  return createAuditLog({
    action: "create",
    entity,
    entityId,
    entityName,
    metadata,
    userId,
  });
}

/**
 * Log an update action with changes
 */
export async function logUpdate<T extends Record<string, unknown>>(
  entity: AuditEntity,
  entityId: string,
  oldData: T,
  newData: Partial<T>,
  entityName?: string,
  userId?: string,
  metadata?: AuditMetadata
): Promise<AuditLog | null> {
  if (!userId) return null;
  const changes = computeChanges(oldData, newData);

  return createAuditLog({
    action: "update",
    entity,
    entityId,
    entityName,
    changes: Object.keys(changes).length > 0 ? changes : undefined,
    metadata,
    userId,
  });
}

/**
 * Log a soft delete action
 */
export async function logDelete(
  entity: AuditEntity,
  entityId: string,
  entityName?: string,
  userId?: string,
  metadata?: AuditMetadata
): Promise<AuditLog | null> {
  if (!userId) return null;
  return createAuditLog({
    action: "delete",
    entity,
    entityId,
    entityName,
    metadata,
    userId,
  });
}

/**
 * Log a restore action
 */
export async function logRestore(
  entity: AuditEntity,
  entityId: string,
  entityName?: string,
  userId?: string,
  metadata?: AuditMetadata
): Promise<AuditLog | null> {
  if (!userId) return null;
  return createAuditLog({
    action: "restore",
    entity,
    entityId,
    entityName,
    metadata,
    userId,
  });
}

// ============================================================
// CHANGE DETECTION
// ============================================================

/**
 * Compute changes between old and new data
 * Only includes fields that actually changed
 */
export function computeChanges<T extends Record<string, unknown>>(
  oldData: T,
  newData: Partial<T>
): AuditChanges {
  const changes: AuditChanges = {};

  for (const key of Object.keys(newData)) {
    const oldValue = oldData[key];
    const newValue = newData[key];

    // Skip undefined new values (not being updated)
    if (newValue === undefined) continue;

    // Compare values (handle Date objects)
    if (!isEqual(oldValue, newValue)) {
      changes[key] = {
        old: serializeValue(oldValue),
        new: serializeValue(newValue),
      } as FieldChange;
    }
  }

  return changes;
}

/**
 * Check if two values are equal
 */
function isEqual(a: unknown, b: unknown): boolean {
  // Handle null/undefined
  if (a === b) return true;
  if (a == null || b == null) return false;

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => isEqual(val, b[idx]));
  }

  // Handle objects
  if (typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) =>
      isEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    );
  }

  return a === b;
}

/**
 * Serialize a value for storage in JSON
 */
function serializeValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

// ============================================================
// AUDIT LOG QUERIES
// ============================================================

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogsForEntity(
  entity: AuditEntity,
  entityId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const logs = await prisma.auditLog.findMany({
    where: {
      entity,
      entityId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs as AuditLog[];
}

/**
 * Get recent audit logs across all entities
 */
export async function getRecentAuditLogs(
  limit: number = 100
): Promise<AuditLog[]> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs as AuditLog[];
}

/**
 * Get audit logs by action type
 */
export async function getAuditLogsByAction(
  action: AuditAction,
  limit: number = 100
): Promise<AuditLog[]> {
  const logs = await prisma.auditLog.findMany({
    where: { action },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs as AuditLog[];
}

/**
 * Get audit logs within a date range
 */
export async function getAuditLogsByDateRange(
  startDate: Date,
  endDate: Date,
  limit: number = 500
): Promise<AuditLog[]> {
  const logs = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs as AuditLog[];
}

// ============================================================
// SOFT DELETE HELPERS
// ============================================================

/**
 * Standard where clause to exclude soft-deleted records
 */
export const notDeleted = { deletedAt: null };

/**
 * Standard where clause to only include soft-deleted records
 */
export const onlyDeleted = { deletedAt: { not: null } };
