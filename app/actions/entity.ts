"use server";

import { revalidatePath } from "next/cache";
import type { EntityType } from "@/types/editor";
import type { ActionResult } from "@/types/editor";
import { prisma } from "@/lib/prisma";

export async function updateEntity(
  entityType: EntityType,
  id: string,
  data: Record<string, unknown>
): Promise<ActionResult> {
  try {
    switch (entityType) {
      case "account":
        await prisma.account.update({
          where: { id },
          data: {
            email: data.email as string,
            provider: data.provider as
              | "google"
              | "icloud"
              | "microsoft"
              | "github",
            label: data.label as string,
            isPrimary: data.isPrimary as boolean,
            notes: data.notes as string,
          },
        });
        revalidatePath("/accounts");
        break;

      case "subscription":
        await prisma.subscription.update({
          where: { id },
          data: {
            name: data.name as string,
            cost: data.cost as number,
            billingCycle: data.billingCycle as
              | "monthly"
              | "yearly"
              | "weekly"
              | "one_time",
            nextDueDate: data.nextDueDate as Date,
            status: data.status as "active" | "cancelled" | "paused" | "trial",
            category: data.category as
              | "streaming"
              | "software"
              | "gaming"
              | "cloud"
              | "productivity"
              | "other",
            notes: data.notes as string,
          },
        });
        revalidatePath("/subscriptions");
        break;

      case "transaction":
        await prisma.transaction.update({
          where: { id },
          data: {
            name: data.name as string,
            amount: data.amount as number,
            type: data.type as "income" | "expense",
            frequency: data.frequency as "monthly" | "yearly" | "one_time",
            category: data.category as
              | "salary"
              | "freelance"
              | "investment"
              | "rent"
              | "utilities"
              | "insurance"
              | "food"
              | "transport"
              | "entertainment"
              | "healthcare"
              | "education"
              | "shopping"
              | "other",
            dueDay: data.dueDay as number,
            isActive: data.isActive as boolean,
            notes: data.notes as string,
          },
        });
        revalidatePath("/finance");
        break;
    }

    return {
      success: true,
      message: `${getEntityName(entityType)} updated successfully`,
    };
  } catch (error) {
    console.error(`Failed to update ${entityType}:`, error);
    return {
      success: false,
      message: `Failed to update ${getEntityName(
        entityType
      )}. Please try again.`,
    };
  }
}

export async function deleteEntity(
  entityType: EntityType,
  id: string
): Promise<ActionResult> {
  try {
    switch (entityType) {
      case "account":
        await prisma.account.delete({ where: { id } });
        revalidatePath("/accounts");
        break;

      case "subscription":
        await prisma.subscription.delete({ where: { id } });
        revalidatePath("/subscriptions");
        break;

      case "transaction":
        await prisma.transaction.delete({ where: { id } });
        revalidatePath("/finance");
        break;
    }

    return {
      success: true,
      message: `${getEntityName(entityType)} deleted successfully`,
    };
  } catch (error) {
    console.error(`Failed to delete ${entityType}:`, error);
    return {
      success: false,
      message: `Failed to delete ${getEntityName(
        entityType
      )}. Please try again.`,
    };
  }
}

function getEntityName(entityType: EntityType): string {
  switch (entityType) {
    case "account":
      return "Account";
    case "subscription":
      return "Subscription";
    case "transaction":
      return "Transaction";
  }
}

export async function createEntity(
  entityType: EntityType,
  data: Record<string, unknown>
): Promise<ActionResult> {
  try {
    switch (entityType) {
      case "account":
        await prisma.account.create({
          data: {
            email: data.email as string,
            provider: data.provider as
              | "google"
              | "icloud"
              | "microsoft"
              | "github",
            label: data.label as string,
            isPrimary: (data.isPrimary as boolean) ?? false,
            notes: (data.notes as string) ?? "",
          },
        });
        revalidatePath("/accounts");
        break;

      case "subscription":
        await prisma.subscription.create({
          data: {
            name: data.name as string,
            cost: data.cost as number,
            billingCycle: data.billingCycle as
              | "monthly"
              | "yearly"
              | "weekly"
              | "one_time",
            nextDueDate: data.nextDueDate as Date,
            status: data.status as "active" | "cancelled" | "paused" | "trial",
            category: data.category as
              | "streaming"
              | "software"
              | "gaming"
              | "cloud"
              | "productivity"
              | "other",
            notes: (data.notes as string) ?? "",
          },
        });
        revalidatePath("/subscriptions");
        break;

      case "transaction":
        await prisma.transaction.create({
          data: {
            name: data.name as string,
            amount: data.amount as number,
            type: data.type as "income" | "expense",
            frequency: data.frequency as "monthly" | "yearly" | "one_time",
            category: data.category as
              | "salary"
              | "freelance"
              | "investment"
              | "rent"
              | "utilities"
              | "insurance"
              | "food"
              | "transport"
              | "entertainment"
              | "healthcare"
              | "education"
              | "shopping"
              | "other",
            dueDay: data.dueDay as number,
            isActive: (data.isActive as boolean) ?? true,
            notes: (data.notes as string) ?? "",
          },
        });
        revalidatePath("/finance");
        break;
    }

    return {
      success: true,
      message: `${getEntityName(entityType)} created successfully`,
    };
  } catch (error) {
    console.error(`Failed to create ${entityType}:`, error);
    return {
      success: false,
      message: `Failed to create ${getEntityName(
        entityType
      )}. Please try again.`,
    };
  }
}
