/*
  Warnings:

  - A unique constraint covering the columns `[provider,userId]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `banks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,userId]` on the table `emails` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[section,userId]` on the table `section_timestamps` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `banks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `credits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `debts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `emails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `incomes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `one_time_bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `recurring_expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `section_timestamps` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NeedRate" AS ENUM ('need', 'can_wait', 'luxury');

-- AlterEnum
ALTER TYPE "AuditEntity" ADD VALUE 'wishlist_item';

-- DropIndex
DROP INDEX "accounts_provider_key";

-- DropIndex
DROP INDEX "banks_name_key";

-- DropIndex
DROP INDEX "emails_email_key";

-- DropIndex
DROP INDEX "section_timestamps_section_key";

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "banks" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "credits" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "debts" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "emails" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "incomes" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "one_time_bills" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "recurring_expenses" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "section_timestamps" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "enabledPlugins" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "whereToBuy" TEXT NOT NULL,
    "needRate" "NeedRate" NOT NULL,
    "reason" TEXT,
    "links" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "documents_userId_idx" ON "documents"("userId");

-- CreateIndex
CREATE INDEX "wishlist_items_userId_idx" ON "wishlist_items"("userId");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_userId_key" ON "accounts"("provider", "userId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "banks_userId_idx" ON "banks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "banks_name_userId_key" ON "banks"("name", "userId");

-- CreateIndex
CREATE INDEX "credits_userId_idx" ON "credits"("userId");

-- CreateIndex
CREATE INDEX "debts_userId_idx" ON "debts"("userId");

-- CreateIndex
CREATE INDEX "emails_userId_idx" ON "emails"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "emails_email_userId_key" ON "emails"("email", "userId");

-- CreateIndex
CREATE INDEX "incomes_userId_idx" ON "incomes"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "one_time_bills_userId_idx" ON "one_time_bills"("userId");

-- CreateIndex
CREATE INDEX "recurring_expenses_userId_idx" ON "recurring_expenses"("userId");

-- CreateIndex
CREATE INDEX "section_timestamps_userId_idx" ON "section_timestamps"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "section_timestamps_section_userId_key" ON "section_timestamps"("section", "userId");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_expenses" ADD CONSTRAINT "recurring_expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_time_bills" ADD CONSTRAINT "one_time_bills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banks" ADD CONSTRAINT "banks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_timestamps" ADD CONSTRAINT "section_timestamps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
