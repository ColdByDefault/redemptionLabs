"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { notDeleted, logCreate, logUpdate } from "@/lib/audit";
import type { WishlistItem, NeedRate } from "@/types/wishlist";

// ============================================================
// READ ACTIONS
// ============================================================

export async function getWishlistItems(): Promise<WishlistItem[]> {
  const items = await prisma.wishlistItem.findMany({
    where: notDeleted,
    orderBy: {
      createdAt: "desc",
    },
  });

  return items;
}

export async function getWishlistItemById(
  id: string
): Promise<WishlistItem | null> {
  const item = await prisma.wishlistItem.findFirst({
    where: {
      id,
      ...notDeleted,
    },
  });

  return item;
}

// ============================================================
// CREATE ACTION
// ============================================================

export interface CreateWishlistItemInput {
  name: string;
  price: number;
  whereToBuy: string;
  needRate: NeedRate;
  reason?: string | null;
  links?: string[];
  imageUrl?: string | null;
}

export async function createWishlistItem(
  input: CreateWishlistItemInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const item = await prisma.wishlistItem.create({
      data: {
        name: input.name,
        price: input.price,
        whereToBuy: input.whereToBuy,
        needRate: input.needRate,
        reason: input.reason ?? null,
        links: input.links ?? [],
        imageUrl: input.imageUrl ?? null,
      },
    });

    await logCreate("wishlist_item", item.id, item.name);
    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("Failed to create wishlist item:", error);
    return { success: false, error: "Failed to create wishlist item" };
  }
}

// ============================================================
// UPDATE ACTION
// ============================================================

export interface UpdateWishlistItemInput {
  id: string;
  name?: string;
  price?: number;
  whereToBuy?: string;
  needRate?: NeedRate;
  reason?: string | null;
  links?: string[];
  imageUrl?: string | null;
}

export async function updateWishlistItem(
  input: UpdateWishlistItemInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, ...data } = input;

    const existing = await prisma.wishlistItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Wishlist item not found" };
    }

    const updated = await prisma.wishlistItem.update({
      where: { id },
      data,
    });

    await logUpdate(
      "wishlist_item",
      id,
      existing as unknown as Record<string, unknown>,
      data as unknown as Record<string, unknown>,
      updated.name
    );
    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("Failed to update wishlist item:", error);
    return { success: false, error: "Failed to update wishlist item" };
  }
}

// ============================================================
// DELETE ACTION (Hard delete for permanent removal)
// ============================================================

export async function deleteWishlistItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.wishlistItem.delete({
      where: { id },
    });

    revalidatePath("/wishlist");
    revalidatePath("/trash");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete wishlist item:", error);
    return { success: false, error: "Failed to delete wishlist item" };
  }
}
