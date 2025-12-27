"use client";

import { Plus, ShoppingCart, Edit2 } from "lucide-react";
import { queuedToast } from "@/store";
import { Button } from "@/components/ui/button";
import { WishlistCard } from "./WishlistCard";
import { WishlistDialog } from "./WishlistDialog";
import { softDeleteWishlistItem } from "@/actions/trash";
import {
  formatPrice,
  calculateTotalValue,
  groupByNeedRate,
} from "@/lib/wishlist";
import type { WishlistItem, NeedRate } from "@/types/wishlist";

interface WishlistBoardProps {
  items: WishlistItem[];
}

const SECTION_ORDER: NeedRate[] = ["need", "can_wait", "luxury"];
const SECTION_LABELS: Record<NeedRate, string> = {
  need: "🔴 Need",
  can_wait: "🟡 Can Wait",
  luxury: "🟢 Luxury",
};

export function WishlistBoard({
  items,
}: WishlistBoardProps): React.ReactElement {
  const grouped = groupByNeedRate(items);
  const totalValue = calculateTotalValue(items);

  async function handleDelete(id: string): Promise<void> {
    const result = await softDeleteWishlistItem(id);
    if (result.success) {
      queuedToast.success("Item moved to trash");
    } else {
      queuedToast.error(result.error ?? "Failed to delete item");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Wishlist</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Total:{" "}
            <span className="font-semibold">{formatPrice(totalValue)}</span>
            {" · "}
            <span className="font-medium">{items.length} items</span>
          </span>
          <WishlistDialog
            mode="create"
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            }
          />
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Your wishlist is empty</p>
          <p className="text-sm mt-1">Add items you want to buy!</p>
        </div>
      )}

      {/* Grouped Cards */}
      {SECTION_ORDER.map((rate) => {
        const sectionItems = grouped[rate];
        if (sectionItems.length === 0) return null;

        return (
          <div key={rate} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {SECTION_LABELS[rate]} ({sectionItems.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sectionItems.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  editTrigger={
                    <WishlistDialog
                      mode="edit"
                      item={item}
                      trigger={
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-background/95 backdrop-blur-sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  }
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
