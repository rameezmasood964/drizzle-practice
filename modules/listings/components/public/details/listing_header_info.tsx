import * as React from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Star, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ListingHeaderInfoProps {
  title: string;
  category: string;
  area: string;
  rating: number;
  reviewCount: number;
}

export function ListingHeaderInfo({
  title,
  category,
  area,
  rating,
  reviewCount,
}: ListingHeaderInfoProps) {
  return (
    <div className="space-y-3">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3" />
        <Link href="/explore" className="transition-colors hover:text-foreground">
          Bahawalpur
        </Link>
        <ChevronRight className="size-3" />
        <Link
          href={`/explore?category=${encodeURIComponent(category.toLowerCase().replace(/\s+/g, "-"))}`}
          className="transition-colors hover:text-foreground"
        >
          {category}
        </Link>
        <ChevronRight className="size-3" />
        <span className="truncate max-w-[200px] font-medium text-foreground">
          {title}
        </span>
      </nav>

      {/* Main Title & Key Meta */}
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl lg:text-4xl">
          {title}
        </h1>

        {/* Info Row: Area, Rating, Verified Badge */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Area Locality */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="size-4 text-primary" />
            <span>{area}, Bahawalpur</span>
          </div>

          <span className="text-muted-foreground">•</span>

          {/* Star Rating */}
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Star className="size-4 fill-primary text-primary" />
            <span>{rating.toFixed(1)}</span>
            <span className="font-normal text-muted-foreground">
              ({reviewCount} Reviews)
            </span>
          </div>

          {/* Verified Badge Pill */}
          <Badge
            variant="secondary"
            className="gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
          >
            <BadgeCheck className="size-3.5" />
            <span>Verified</span>
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default ListingHeaderInfo;

