import { z } from "zod";

// ============================================================
// ENUM SCHEMAS
// ============================================================

export const needRateSchema = z.enum(["need", "can_wait", "luxury"]);

// ============================================================
// WISHLIST ITEM SCHEMAS
// ============================================================

export const createWishlistItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  price: z.number().min(0, "Price must be positive"),
  whereToBuy: z.string().min(1, "Where to buy is required"),
  needRate: needRateSchema,
  reason: z.string().nullable().optional(),
  links: z.array(z.string().url("Must be a valid URL")).default([]),
  imageUrl: z.string().url("Must be a valid URL").nullable().optional(),
});

export const updateWishlistItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Item name cannot be empty").optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  whereToBuy: z.string().min(1, "Where to buy cannot be empty").optional(),
  needRate: needRateSchema.optional(),
  reason: z.string().nullable().optional(),
  links: z.array(z.string().url("Must be a valid URL")).optional(),
  imageUrl: z.string().url("Must be a valid URL").nullable().optional(),
});

export const deleteWishlistItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateWishlistItemInput = z.infer<typeof createWishlistItemSchema>;
export type UpdateWishlistItemInput = z.infer<typeof updateWishlistItemSchema>;
