"use client";

import { ExternalLink, Trash2, MapPin, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  formatPrice,
  formatNeedRate,
  getNeedRateVariant,
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
    <div className="group relative rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Image Section - Large Hero Style */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        {item.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <span className="text-5xl opacity-50">📦</span>
          </div>
        )}

        {/* Price Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <div className="bg-background/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
            <span className="font-bold text-lg text-foreground">
              {formatPrice(item.price)}
            </span>
          </div>
        </div>

        {/* Priority Badge - Top Left */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={getNeedRateVariant(item.needRate)}
            className="shadow-lg"
          >
            {formatNeedRate(item.needRate)}
          </Badge>
        </div>

        {/* Quick Actions - Appears on Hover */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>{editTrigger}</div>
              </TooltipTrigger>
              <TooltipContent>Edit item</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => onDelete(item.id)}
                  className="h-8 w-8 bg-background/95 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete item</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Title & Location */}
        <div>
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {item.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{item.whereToBuy || "Location not specified"}</span>
          </div>
        </div>

        {/* Reason */}
        {item.reason ? (
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2 italic">
            &ldquo;{item.reason}&rdquo;
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/50 bg-muted/30 rounded-lg p-2 italic">
            No reason specified
          </p>
        )}

        {/* Shop Links - Show All */}
        <div className="space-y-2">
          <Separator />
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Shop Links
            </span>
            {item.links.length > 0 ? (
              <div className="flex flex-col gap-1">
                <TooltipProvider>
                  {item.links.map((link, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors py-1 px-2 -mx-2 rounded-md hover:bg-muted/50"
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {extractDomain(link)}
                          </span>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="break-all text-xs">{link}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic py-1">
                No links added
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
