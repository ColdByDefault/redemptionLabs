// Types for Audit Log
// Mirrors Prisma schema enums and models

// ============================================================
// ENUMS
// ============================================================

export type AuditAction = "create" | "update" | "delete" | "restore";

export type AuditEntity =
  | "email"
  | "account"
  | "income"
  | "debt"
  | "credit"
  | "recurring_expense"
  | "one_time_bill"
  | "bank"
  | "wishlist_item";

// ============================================================
// CHANGE TRACKING
// ============================================================

export interface FieldChange<T = unknown> {
  old: T;
  new: T;
}

export type AuditChanges = Record<string, FieldChange>;

export interface AuditMetadata {
  ipAddress?: string;
  userAgent?: string;
  source?: string;
  [key: string]: unknown;
}

// ============================================================
// AUDIT LOG MODEL
// ============================================================

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityName: string | null;
  changes: AuditChanges | null;
  metadata: AuditMetadata | null;
  createdAt: Date;
}

// ============================================================
// SOFT DELETE MIXIN
// ============================================================

export interface SoftDeletable {
  deletedAt: Date | null;
}

// ============================================================
// AUDIT LOG INPUT
// ============================================================

export interface CreateAuditLogInput {
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityName?: string | undefined;
  changes?: AuditChanges | undefined;
  metadata?: AuditMetadata | undefined;
}
