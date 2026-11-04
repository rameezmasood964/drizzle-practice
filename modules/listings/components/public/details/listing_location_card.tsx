import * as React from "react";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ListingLocationCardProps {
  fullAddress: string;
  landmark?: string;
  mapUrl: string;
}

export function ListingLocationCard({
  fullAddress,
  landmark,
  mapUrl,
}: ListingLocationCardProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Location & Address
        </h2>

        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-primary">
          <a href={mapUrl} target="_blank" rel="noopener noreferrer">
            <span>Open in Maps</span>
            <ExternalLink className="size-3" />
          </a>
        </Button>
      </div>

      {/* Visual Map Preview Container (Clickable) */}
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open location in Google Maps"
        className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 transition-colors hover:border-primary/50"
      >
        {/* Subtle Map Grid Pattern Effect */}
        <div
          className="absolute inset-0 bg-[radial-gradient(#80808020_1px,transparent_1px)] [background-size:16px_16px]"
          aria-hidden="true"
        />

        {/* Center Pin Indicator */}
        <div className="relative flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform duration-200 group-hover:scale-110">
            <MapPin className="size-6" />
          </div>
          <span className="rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-xs backdrop-blur-xs">
            Click to view on Google Maps
          </span>
        </div>
      </a>

      {/* Address Details */}
      <div className="space-y-1.5 pt-2 text-sm">
        <div className="flex items-start gap-2 text-foreground">
          <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
          <span className="font-medium leading-relaxed">{fullAddress}</span>
        </div>

        {landmark && (
          <div className="flex items-center gap-2 pl-6 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/80">Landmark:</span>
            <span>{landmark}</span>
          </div>
        )}
      </div>

      {/* Action CTA Button */}
      <div className="pt-2">
        <Button variant="outline" asChild className="w-full gap-2 sm:w-auto">
          <a href={mapUrl} target="_blank" rel="noopener noreferrer">
            <Navigation className="size-4 text-primary" />
            <span>Get Directions / Open in Google Maps</span>
          </a>
        </Button>
      </div>
    </section>
  );
}

export default ListingLocationCard;

