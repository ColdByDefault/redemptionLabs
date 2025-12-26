"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, Upload, Link as LinkIcon } from "lucide-react";
import { queuedToast } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createWishlistItem, updateWishlistItem } from "@/actions/wishlist";
import { softDeleteWishlistItem } from "@/actions/trash";
import type { WishlistItem, NeedRate } from "@/types/wishlist";

// ============================================================
// TYPES
// ============================================================

interface WishlistDialogProps {
  item?: WishlistItem;
  trigger: React.ReactNode;
  mode: "create" | "edit";
}

// ============================================================
// CONSTANTS
// ============================================================

const NEED_RATES: { value: NeedRate; label: string }[] = [
  { value: "need", label: "Need" },
  { value: "can_wait", label: "Can Wait" },
  { value: "luxury", label: "Luxury" },
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// ============================================================
// COMPONENT
// ============================================================

export function WishlistDialog({
  item,
  trigger,
  mode,
}: WishlistDialogProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [whereToBuy, setWhereToBuy] = useState("");
  const [needRate, setNeedRate] = useState<NeedRate>("can_wait");
  const [reason, setReason] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");

  // Reset form when dialog opens/closes or item changes
  useEffect(() => {
    if (open && mode === "edit" && item) {
      setName(item.name);
      setPrice(item.price.toString());
      setWhereToBuy(item.whereToBuy);
      setNeedRate(item.needRate);
      setReason(item.reason ?? "");
      setLinks([...item.links]);
      setNewLink("");
      setImageUrl(item.imageUrl ?? "");
      // Detect if it's a base64 image or URL
      setImageMode(item.imageUrl?.startsWith("data:") ? "upload" : "url");
    } else if (open && mode === "create") {
      setName("");
      setPrice("");
      setWhereToBuy("");
      setNeedRate("can_wait");
      setReason("");
      setLinks([]);
      setNewLink("");
      setImageUrl("");
      setImageMode("url");
    }
  }, [open, mode, item]);

  function handleAddLink(): void {
    const trimmedLink = newLink.trim();
    if (!trimmedLink) return;

    try {
      new URL(trimmedLink);
      setLinks((prev) => [...prev, trimmedLink]);
      setNewLink("");
    } catch {
      queuedToast.error("Invalid URL");
    }
  }

  function handleRemoveLink(index: number): void {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      queuedToast.error("Image must be less than 10MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      queuedToast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);
    };
    reader.onerror = () => {
      queuedToast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage(): void {
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(): Promise<void> {
    if (!name.trim() || !whereToBuy.trim()) {
      queuedToast.error("Name and where to buy are required");
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      queuedToast.error("Price must be a valid positive number");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const result = await createWishlistItem({
          name: name.trim(),
          price: priceValue,
          whereToBuy: whereToBuy.trim(),
          needRate,
          reason: reason.trim() || null,
          links,
          imageUrl: imageUrl.trim() || null,
        });

        if (result.success) {
          queuedToast.success("Item added to wishlist");
          setOpen(false);
        } else {
          queuedToast.error(result.error ?? "Failed to add item");
        }
      } else if (mode === "edit" && item) {
        const result = await updateWishlistItem({
          id: item.id,
          name: name.trim(),
          price: priceValue,
          whereToBuy: whereToBuy.trim(),
          needRate,
          reason: reason.trim() || null,
          links,
          imageUrl: imageUrl.trim() || null,
        });

        if (result.success) {
          queuedToast.success("Wishlist item updated");
          setOpen(false);
        } else {
          queuedToast.error(result.error ?? "Failed to update item");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      queuedToast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!item) return;

    setIsDeleting(true);

    try {
      const result = await softDeleteWishlistItem(item.id);
      if (result.success) {
        queuedToast.success("Item moved to trash");
        setOpen(false);
      } else {
        queuedToast.error(result.error ?? "Failed to delete item");
      }
    } catch (error) {
      console.error("Delete error:", error);
      queuedToast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Wishlist Item" : "Edit Wishlist Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (€) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Where to Buy */}
          <div className="space-y-2">
            <Label htmlFor="whereToBuy">Where to Buy *</Label>
            <Input
              id="whereToBuy"
              value={whereToBuy}
              onChange={(e) => setWhereToBuy(e.target.value)}
              placeholder="Amazon, Local Store, etc."
            />
          </div>

          {/* Need Rate */}
          <div className="space-y-2">
            <Label htmlFor="needRate">Priority</Label>
            <Select
              value={needRate}
              onValueChange={(value) => setNeedRate(value as NeedRate)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {NEED_RATES.map((rate) => (
                  <SelectItem key={rate.value} value={rate.value}>
                    {rate.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason to Buy</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you want this item?"
              rows={2}
            />
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant={imageMode === "upload" ? "default" : "outline"}
                size="sm"
                onClick={() => setImageMode("upload")}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
              <Button
                type="button"
                variant={imageMode === "url" ? "default" : "outline"}
                size="sm"
                onClick={() => setImageMode("url")}
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                URL
              </Button>
            </div>

            {imageMode === "upload" ? (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90
                    file:cursor-pointer cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Max size: 10MB. Supported: JPG, PNG, GIF, WebP
                </p>
              </div>
            ) : (
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            )}

            {/* Image Preview */}
            {imageUrl && (
              <div className="relative mt-2 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-5 w-5"
                  onClick={handleRemoveImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="space-y-2">
            <Label>Shop Links</Label>
            <div className="flex gap-2">
              <Input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddLink}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {links.length > 0 && (
              <div className="space-y-1 mt-2">
                {links.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm bg-muted rounded px-2 py-1"
                  >
                    <span className="truncate flex-1">{link}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => handleRemoveLink(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          {mode === "edit" && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
          <div className={`flex gap-2 ${mode === "create" ? "ml-auto" : ""}`}>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Add Item"
                : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
