"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatPrice,
  formatNeedRate,
  getNeedRateVariant,
  getNeedRateColor,
  extractDomain,
} from "@/lib/wishlist";
import type { WishlistItem } from "@/types/wishlist";

interface WishlistCardProps {
  item: WishlistItem;
  editTrigger: React.ReactNode;
  onDelete: (id: string) => void;
}

export function WishlistCard({
  item,
  editTrigger,
  onDelete,
}: WishlistCardProps): React.ReactElement {
  return (
    <div
      className={`rounded-xl border bg-card p-4 border-l-4 ${getNeedRateColor(
        item.needRate
      )} flex flex-col gap-3`}
    >
      {/* Header: Image + Title + Price */}
      <div className="flex gap-4">
        {/* Image */}
        {item.imageUrl ? (
          <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide broken images
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="shrink-0 w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-2xl text-muted-foreground">📦</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base truncate">{item.name}</h3>
            <span className="shrink-0 font-bold text-lg">
              {formatPrice(item.price)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            {item.whereToBuy}
          </p>

          <Badge variant={getNeedRateVariant(item.needRate)} className="mt-2">
            {formatNeedRate(item.needRate)}
          </Badge>
        </div>
      </div>

      {/* Reason */}
      {item.reason && (
        <p className="text-sm text-muted-foreground italic">
          &ldquo;{item.reason}&rdquo;
        </p>
      )}

      {/* Links */}
      {item.links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            {item.links.map((link, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {extractDomain(link)}
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-80 truncate">{link}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        {editTrigger}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="h-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}
