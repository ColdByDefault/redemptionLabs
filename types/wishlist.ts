// Types for Wishlist models
// Mirrors Prisma schema enums and models

export type NeedRate = "need" | "can_wait" | "luxury";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  whereToBuy: string;
  needRate: NeedRate;
  reason: string | null;
  links: string[];
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
