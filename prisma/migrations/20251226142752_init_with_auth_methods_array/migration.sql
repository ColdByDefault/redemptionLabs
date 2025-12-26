-- CreateEnum
CREATE TYPE "EmailCategory" AS ENUM ('primary', 'secondary', 'temp');

-- CreateEnum
CREATE TYPE "AccountTier" AS ENUM ('free', 'paid');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'yearly', 'lifetime', 'onetime');

-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('none', 'twofa', 'passkey', 'sms', 'authenticator', 'other');

-- CreateEnum
CREATE TYPE "PaymentCycle" AS ENUM ('monthly', 'yearly', 'weekly', 'onetime');

-- CreateEnum
CREATE TYPE "TrialType" AS ENUM ('none', 'week', 'month', 'custom');

-- CreateEnum
CREATE TYPE "RecurringCycle" AS ENUM ('monthly', 'yearly', 'weekly');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('subscription', 'debt');

-- CreateEnum
CREATE TYPE "BankName" AS ENUM ('volksbank', 'sparkasse', 'volksbank_visa', 'paypal');

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "alias" TEXT,
    "category" "EmailCategory" NOT NULL,
    "tier" "AccountTier" NOT NULL,
    "price" DOUBLE PRECISION,
    "billingCycle" "BillingCycle",
    "password" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "tier" "AccountTier" NOT NULL,
    "price" DOUBLE PRECISION,
    "dueDate" TIMESTAMP(3),
    "billingCycle" "BillingCycle",
    "authMethods" "AuthMethod"[] DEFAULT ARRAY['none']::"AuthMethod"[],
    "username" TEXT,
    "password" TEXT,
    "notes" TEXT,
    "emailId" TEXT NOT NULL,
    "linkedBankId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "cycle" "PaymentCycle" NOT NULL,
    "nextPaymentDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "remainingAmount" DOUBLE PRECISION NOT NULL,
    "payTo" TEXT NOT NULL,
    "cycle" "PaymentCycle" NOT NULL,
    "paymentMonth" TEXT,
    "dueDate" TIMESTAMP(3),
    "monthsRemaining" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credits" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "totalLimit" DOUBLE PRECISION NOT NULL,
    "usedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_expenses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3),
    "cycle" "RecurringCycle" NOT NULL,
    "trialType" "TrialType" NOT NULL DEFAULT 'none',
    "trialEndDate" TIMESTAMP(3),
    "category" "ExpenseCategory" NOT NULL,
    "linkedCreditId" TEXT,
    "linkedDebtId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_time_bills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payTo" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "one_time_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banks" (
    "id" TEXT NOT NULL,
    "name" "BankName" NOT NULL,
    "displayName" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastBalanceUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "emails_email_key" ON "emails"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_key" ON "accounts"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "banks_name_key" ON "banks"("name");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
