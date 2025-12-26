"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, Upload, Link as LinkIcon, Check } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
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

interface FormErrors {
  name?: string;
  price?: string;
  whereToBuy?: string;
  newLink?: string;
  image?: string;
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

  // Error state
  const [errors, setErrors] = useState<FormErrors>({});

  // Clear specific error when field changes
  function clearError(field: keyof FormErrors): void {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

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
      setImageMode(item.imageUrl?.startsWith("data:") ? "upload" : "url");
      setErrors({});
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
      setErrors({});
    }
  }, [open, mode, item]);

  function handleAddLink(): void {
    const trimmedLink = newLink.trim();
    if (!trimmedLink) return;

    try {
      new URL(trimmedLink);
      setLinks((prev) => [...prev, trimmedLink]);
      setNewLink("");
      clearError("newLink");
    } catch {
      setErrors((prev) => ({ ...prev, newLink: "Invalid URL format" }));
    }
  }

  function handleRemoveLink(index: number): void {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({ ...prev, image: "Image must be less than 10MB" }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select an image file" }));
      return;
    }

    clearError("image");
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);
    };
    reader.onerror = () => {
      setErrors((prev) => ({ ...prev, image: "Failed to read image file" }));
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage(): void {
    setImageUrl("");
    clearError("image");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Item name is required";
    }

    if (!whereToBuy.trim()) {
      newErrors.whereToBuy = "Where to buy is required";
    }

    const priceValue = parseFloat(price);
    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(priceValue)) {
      newErrors.price = "Price must be a valid number";
    } else if (priceValue < 0) {
      newErrors.price = "Price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(): Promise<void> {
    if (!validateForm()) {
      return;
    }

    const priceValue = parseFloat(price);
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
            <Label
              htmlFor="name"
              className={cn(errors.name && "text-destructive")}
            >
              Item Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
              placeholder="Enter item name"
              aria-invalid={!!errors.name}
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label
              htmlFor="price"
              className={cn(errors.price && "text-destructive")}
            >
              Price (€) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                clearError("price");
              }}
              placeholder="0.00"
              aria-invalid={!!errors.price}
              className={cn(errors.price && "border-destructive")}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price}</p>
            )}
          </div>

          {/* Where to Buy */}
          <div className="space-y-2">
            <Label
              htmlFor="whereToBuy"
              className={cn(errors.whereToBuy && "text-destructive")}
            >
              Where to Buy <span className="text-destructive">*</span>
            </Label>
            <Input
              id="whereToBuy"
              value={whereToBuy}
              onChange={(e) => {
                setWhereToBuy(e.target.value);
                clearError("whereToBuy");
              }}
              placeholder="Amazon, Local Store, etc."
              aria-invalid={!!errors.whereToBuy}
              className={cn(errors.whereToBuy && "border-destructive")}
            />
            {errors.whereToBuy && (
              <p className="text-xs text-destructive">{errors.whereToBuy}</p>
            )}
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
            <Label className={cn(errors.image && "text-destructive")}>
              Image
            </Label>
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant={imageMode === "upload" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setImageMode("upload");
                  clearError("image");
                }}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
              <Button
                type="button"
                variant={imageMode === "url" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setImageMode("url");
                  clearError("image");
                }}
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
                  className={cn(
                    "block w-full text-sm text-muted-foreground",
                    "file:mr-4 file:py-2 file:px-4",
                    "file:rounded-md file:border-0",
                    "file:text-sm file:font-medium",
                    "file:bg-primary file:text-primary-foreground",
                    "hover:file:bg-primary/90",
                    "file:cursor-pointer cursor-pointer"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Max size: 10MB. Supported: JPG, PNG, GIF, WebP
                </p>
              </div>
            ) : (
              <Input
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  clearError("image");
                }}
                placeholder="https://example.com/image.jpg"
              />
            )}

            {errors.image && (
              <p className="text-xs text-destructive">{errors.image}</p>
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
            <Label className={cn(errors.newLink && "text-destructive")}>
              Shop Links
            </Label>
            <div className="flex gap-2">
              <Input
                value={newLink}
                onChange={(e) => {
                  setNewLink(e.target.value);
                  clearError("newLink");
                }}
                placeholder="https://..."
                aria-invalid={!!errors.newLink}
                className={cn(errors.newLink && "border-destructive")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddLink}
                    disabled={!newLink.trim()}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add this link</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      handleAddLink();
                      // Focus back to input for adding more
                    }}
                    disabled={!newLink.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add & continue adding more</TooltipContent>
              </Tooltip>
            </div>
            {errors.newLink && (
              <p className="text-xs text-destructive">{errors.newLink}</p>
            )}
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
