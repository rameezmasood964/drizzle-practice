import * as React from "react";
import Link from "next/link";
import {
  Bed,
  UtensilsCrossed,
  Stethoscope,
  GraduationCap,
  Wrench,
  ShoppingBag,
  Dumbbell,
  Building2,
  Scale,
  Store,
  Folder,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface CategoryCardProps {
  title: string;
  slug: string;
  iconName: string;
  count: number;
  subcategories: string[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Bed,
  UtensilsCrossed,
  Stethoscope,
  GraduationCap,
  Wrench,
  ShoppingBag,
  Dumbbell,
  Building2,
  Scale,
  Store,
};

export function CategoryCard({
  title,
  slug,
  iconName,
  count,
  subcategories = [],
}: CategoryCardProps) {
  const IconComponent = ICON_MAP[iconName] || Folder;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 sm:p-6",
        "shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
      )}
    >
      <div>
        {/* Top Header: Icon & Listings Count Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
            <IconComponent className="size-6" />
          </div>

          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-muted-foreground group-hover:text-foreground"
          >
            {count}+ Places
          </Badge>
        </div>

        {/* Category Title (Linked) */}
        <Link
          href={`/explore?category=${slug}`}
          className="mt-4 block focus:outline-none"
        >
          <h3 className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>
        </Link>

        {/* Subcategories Pill List */}
        {subcategories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {subcategories.map((sub) => (
              <Link
                key={sub}
                href={`/explore?category=${slug}&search=${encodeURIComponent(sub)}`}
                className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent hover:text-foreground"
              >
                {sub}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation Link */}
      <div className="mt-5 border-t border-border/50 pt-3">
        <Link
          href={`/explore?category=${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:underline"
        >
          <span>Explore all {title}</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export default CategoryCard;

