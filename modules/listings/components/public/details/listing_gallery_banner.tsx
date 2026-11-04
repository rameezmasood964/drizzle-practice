import * as React from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ListingGalleryBannerProps {
  images?: string[];
  title: string;
  isOpen: boolean;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80";

export function ListingGalleryBanner({
  images = [],
  title,
  isOpen,
}: ListingGalleryBannerProps) {
  const primaryImage = images[0] || FALLBACK_IMAGE;
  const secondaryImage1 = images[1];
  const secondaryImage2 = images[2];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
      {/* Primary Main Image (2 columns on desktop) */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted md:col-span-2">
        <Image
          src={primaryImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />

        {/* Gradient Overlay for Top Badge */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"
          aria-hidden="true"
        />

        {/* Status Badge (Top-Left) */}
        <div className="absolute left-4 top-4">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-xs",
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
            <span>{isOpen ? "Open Now" : "Closed"}</span>
          </div>
        </div>
      </div>

      {/* Stacked Thumbnails (Right Column on desktop) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-4">
        {/* Thumbnail 1 */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted md:h-full md:aspect-auto">
          {secondaryImage1 ? (
            <Image
              src={secondaryImage1}
              alt={`${title} interior 1`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-[140px] items-center justify-center bg-muted/60 text-muted-foreground">
              <ImageIcon className="size-8 opacity-40" />
            </div>
          )}
        </div>

        {/* Thumbnail 2 */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted md:h-full md:aspect-auto">
          {secondaryImage2 ? (
            <Image
              src={secondaryImage2}
              alt={`${title} interior 2`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-[140px] items-center justify-center bg-muted/60 text-muted-foreground">
              <ImageIcon className="size-8 opacity-40" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListingGalleryBanner;

