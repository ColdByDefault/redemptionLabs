-- AlterTable
ALTER TABLE "one_time_bills" ADD COLUMN     "linkedBankId" TEXT;

-- AlterTable
ALTER TABLE "recurring_expenses" ADD COLUMN     "linkedBankId" TEXT;
