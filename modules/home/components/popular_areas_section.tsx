import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  ShieldCheck,
  Store,
  GraduationCap,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PopularArea {
  name: string;
  slug: string;
  count: string;
  highlight: string;
  icon: LucideIcon;
}

const POPULAR_AREAS: PopularArea[] = [
  {
    name: "Satellite Town",
    slug: "satellite-town",
    count: "120+ Listings",
    highlight: "Hostels & Cafes",
    icon: MapPin,
  },
  {
    name: "Model Town",
    slug: "model-town",
    count: "95+ Listings",
    highlight: "Clinics & Markets",
    icon: Building2,
  },
  {
    name: "Bahawalpur Cantt",
    slug: "cantt",
    count: "60+ Listings",
    highlight: "Dining & Marts",
    icon: ShieldCheck,
  },
  {
    name: "Farid Gate & Circular Rd",
    slug: "farid-gate-circular-rd",
    count: "140+ Listings",
    highlight: "Wholesale & Street Food",
    icon: Store,
  },
  {
    name: "Baghdad-ul-Jadeed (IUB)",
    slug: "baghdad-ul-jadeed-iub",
    count: "50+ Listings",
    highlight: "Student Hostels & Living",
    icon: GraduationCap,
  },
];

export function PopularAreasSection() {
  return (
    <section className="border-b border-border bg-background py-14 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Explore Bahawalpur by Area
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Find verified places and services in your neighborhood
            </p>
          </div>

          <Button
            variant="ghost"
            asChild
            className="group/link -ml-3 w-fit text-sm font-medium text-muted-foreground hover:text-foreground sm:ml-0"
          >
            <Link href="/explore" className="flex items-center gap-1.5">
              <span>View All Areas</span>
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/link:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Areas Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {POPULAR_AREAS.map((area) => {
            const Icon = area.icon;
            return (
              <Link
                key={area.slug}
                href={`/explore?area=${area.slug}`}
                className={cn(
                  "group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 sm:p-5",
                  "shadow-xs transition-all duration-200",
                  "hover:-translate-y-1 hover:border-primary/50 hover:bg-accent/40 hover:shadow-md"
                )}
              >
                <div>
                  {/* Top: Icon + Listings Count Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground sm:size-11">
                      <Icon className="size-5" />
                    </div>
                  </div>

                  {/* Title & Highlight */}
                  <div className="mt-4">
                    <h3 className="line-clamp-1 font-semibold text-foreground tracking-tight transition-colors group-hover:text-primary sm:text-base">
                      {area.name}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {area.highlight}
                    </p>
                  </div>
                </div>

                {/* Bottom Count Pill */}
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs font-medium text-primary">
                    {area.count}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PopularAreasSection;

