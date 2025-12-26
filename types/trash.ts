import type { AuditEntity } from "@/types/audit";

export interface DeletedItem {
  id: string;
  name: string;
  entityType: AuditEntity;
  deletedAt: Date;
  details?: string;
}
