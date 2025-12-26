-- CreateEnum
CREATE TYPE "SectionName" AS ENUM ('emails', 'accounts', 'banks', 'income_overview', 'recurring_expenses', 'one_time_bills');

-- CreateTable
CREATE TABLE "section_timestamps" (
    "id" TEXT NOT NULL,
    "section" "SectionName" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "section_timestamps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "section_timestamps_section_key" ON "section_timestamps"("section");
