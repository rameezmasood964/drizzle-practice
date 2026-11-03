import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  BadgeCheck,
  Phone,
  MessageCircle,
  ArrowRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FeaturedListing {
  id: string;
  title: string;
  slug: string;
  category: string;
  area: string;
  rating: number;
  reviewsCount: number;
  highlightText: string;
  isPrice?: boolean;
  imageUrl: string;
  phone: string;
  whatsapp: string;
}

const FEATURED_LISTINGS: FeaturedListing[] = [
  {
    id: "1",
    title: "Al-Madina Boys Hostel",
    slug: "al-madina-boys-hostel",
    category: "Hostels & Living",
    area: "Satellite Town",
    rating: 4.8,
    reviewsCount: 34,
    highlightText: "Rs. 9,500/mo",
    isPrice: true,
    imageUrl:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    phone: "+923001234567",
    whatsapp: "923001234567",
  },
  {
    id: "2",
    title: "Dr. Naveed Dental Clinic",
    slug: "dr-naveed-dental-clinic",
    category: "Doctors & Clinics",
    area: "Model Town A",
    rating: 4.9,
    reviewsCount: 58,
    highlightText: "Open Now",
    isPrice: false,
    imageUrl:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    phone: "+923019876543",
    whatsapp: "923019876543",
  },
  {
    id: "3",
    title: "Royal Cafe & Grill",
    slug: "royal-cafe-grill",
    category: "Food & Dining",
    area: "Cantt Commercial",
    rating: 4.7,
    reviewsCount: 82,
    highlightText: "Open Now",
    isPrice: false,
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    phone: "+923023456789",
    whatsapp: "923023456789",
  },
  {
    id: "4",
    title: "Iron Grip Fitness Gym",
    slug: "iron-grip-fitness-gym",
    category: "Gyms & Fitness",
    area: "Dubai Mahal Road",
    rating: 4.6,
    reviewsCount: 29,
    highlightText: "Open Now",
    isPrice: false,
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    phone: "+923034567890",
    whatsapp: "923034567890",
  },
];

export function FeaturedListingsSection() {
  return (
    <section className="border-b border-border bg-background py-14 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Featured in Bahawalpur
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Top-rated and verified places handpicked for you
            </p>
          </div>

          <Button
            variant="ghost"
            asChild
            className="group/link -ml-3 w-fit text-sm font-medium text-muted-foreground hover:text-foreground sm:ml-0"
          >
            <Link href="/explore" className="flex items-center gap-1.5">
              <span>Explore All Listings</span>
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/link:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Listings Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_LISTINGS.map((listing) => (
            <div
              key={listing.id}
              className={cn(
                "group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card",
                "shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              )}
            >
              {/* Top Section / Clickable Area */}
              <div>
                {/* 16:9 Media Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <Image
                    src={listing.imageUrl}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Gradient Overlay for badge contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

                  {/* Overlaid Badges */}
                  <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-1.5">
                    <Badge
                      variant="default"
                      className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase"
                    >
                      Featured
                    </Badge>

                    <div className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-xs">
                      <BadgeCheck className="size-3 text-primary" />
                      <span>Verified</span>
                    </div>
                  </div>

                  {/* Highlight pill (Price / Open Status) on bottom right of image */}
                  <div className="absolute bottom-2 right-2">
                    <span className="rounded-md bg-background/95 px-2 py-0.5 text-xs font-semibold text-foreground shadow-xs backdrop-blur-xs">
                      {listing.isPrice ? (
                        listing.highlightText
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3 text-primary" />
                          {listing.highlightText}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4">
                  {/* Category & Area */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-primary">
                      {listing.category}
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="size-3 shrink-0" />
                      {listing.area}
                    </span>
                  </div>

                  {/* Business Title */}
                  <Link
                    href={`/explore?search=${encodeURIComponent(listing.title)}`}
                    className="mt-2 block"
                  >
                    <h3 className="line-clamp-1 font-semibold text-foreground tracking-tight transition-colors group-hover:text-primary sm:text-base">
                      {listing.title}
                    </h3>
                  </Link>

                  {/* Rating & Reviews */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      <Star className="size-3.5 fill-primary text-primary" />
                      <span>{listing.rating.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span>({listing.reviewsCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Contact Actions */}
              <div className="border-t border-border/80 bg-muted/20 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium"
                    asChild
                  >
                    <a href={`tel:${listing.phone}`}>
                      <Phone className="size-3.5" />
                      <span>Call</span>
                    </a>
                  </Button>

                  <Button
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${listing.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedListingsSection;

