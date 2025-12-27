-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'item_created';
ALTER TYPE "NotificationType" ADD VALUE 'item_updated';
ALTER TYPE "NotificationType" ADD VALUE 'item_deleted';
ALTER TYPE "NotificationType" ADD VALUE 'item_restored';
ALTER TYPE "NotificationType" ADD VALUE 'info';
ALTER TYPE "NotificationType" ADD VALUE 'success';
ALTER TYPE "NotificationType" ADD VALUE 'warning';
ALTER TYPE "NotificationType" ADD VALUE 'error';
