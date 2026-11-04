import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { CardImageBanner } from "./card/card_image_banner";
import { CardContentInfo } from "./card/card_content_info";
import { CardActionButtons } from "./card/card_action_buttons";

export interface ListingCardProps {
  id: string;
  slug: string;
  title: string;
  category: string;
  area: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  priceRange?: string;
  tags: string[];
  phone: string;
  whatsapp: string;
}

export function ListingGridCardWrapper({
  slug,
  title,
  category,
  area,
  imageUrl,
  rating,
  reviewCount,
  isOpen,
  priceRange,
  tags,
  phone,
  whatsapp,
}: ListingCardProps) {
  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-0",
        "shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
      )}
    >
      {/* Clickable Header & Content navigating to listing detail */}
      <Link
        href={`/listings/${slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CardImageBanner
          imageUrl={imageUrl}
          title={title}
          rating={rating}
          reviewCount={reviewCount}
          isOpen={isOpen}
        />

        <CardContentInfo
          category={category}
          title={title}
          area={area}
          priceRange={priceRange}
          tags={tags}
        />
      </Link>

      {/* Direct Contact Actions (Call & WhatsApp) with event propagation stopped */}
      <CardActionButtons phone={phone} whatsapp={whatsapp} />
    </Card>
  );
}

export default ListingGridCardWrapper;

