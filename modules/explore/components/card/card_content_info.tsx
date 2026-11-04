import * as React from "react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CardContentInfoProps {
  category: string;
  title: string;
  area: string;
  priceRange?: string;
  tags: string[];
}

export function CardContentInfo({
  category,
  title,
  area,
  priceRange,
  tags = [],
}: CardContentInfoProps) {
  const displayedTags = tags.slice(0, 3);

  return (
    <div className="space-y-2 p-4">
      {/* Category & Price Range Subtitle */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-primary line-clamp-1">
          {category}
        </span>
        {priceRange && (
          <span className="font-semibold text-foreground shrink-0 ml-2">
            {priceRange}
          </span>
        )}
      </div>

      {/* Business Title */}
      <h3 className="truncate text-base font-semibold text-foreground tracking-tight transition-colors group-hover:text-primary">
        {title}
      </h3>

      {/* Locality with MapPin */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{area}, Bahawalpur</span>
      </div>

      {/* Amenity / Highlight Tags (Top 2-3) */}
      {displayedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {displayedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-2 py-0.5 text-[11px] font-normal text-muted-foreground"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default CardContentInfo;

