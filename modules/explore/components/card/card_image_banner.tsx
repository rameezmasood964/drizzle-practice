import * as React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardImageBannerProps {
  imageUrl: string;
  title: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
}

export function CardImageBanner({
  imageUrl,
  title,
  rating,
  reviewCount,
  isOpen,
}: CardImageBannerProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted">
      {/* Background Image with Hover Zoom */}
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Top Gradient Overlay for Badge Contrast */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25"
        aria-hidden="true"
      />

      {/* Badges Bar */}
      <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-1.5">
        {/* Rating Badge (Top-Left) */}
        <div className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/90 px-2 py-0.5 text-xs font-semibold text-foreground shadow-xs backdrop-blur-xs">
          <Star className="size-3.5 fill-primary text-primary" />
          <span>{rating.toFixed(1)}</span>
          {reviewCount > 0 && (
            <span className="text-[11px] font-normal text-muted-foreground">
              ({reviewCount})
            </span>
          )}
        </div>

        {/* Status Badge (Top-Right) */}
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background/90 px-2.5 py-0.5 text-xs font-medium backdrop-blur-xs shadow-xs",
            isOpen ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <span className="relative flex size-2">
            {isOpen ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </>
            ) : (
              <span className="relative inline-flex size-2 rounded-full bg-muted-foreground/60" />
            )}
          </span>
          <span className="text-[11px] font-medium">
            {isOpen ? "Open Now" : "Closed"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CardImageBanner;

