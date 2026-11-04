import * as React from "react";
import { Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ListingAmenitiesListProps {
  amenities: Record<string, boolean | string>;
}

// Convert camelCase or kebab-case keys into readable titles
function formatAmenityLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function ListingAmenitiesList({ amenities = {} }: ListingAmenitiesListProps) {
  const entries = Object.entries(amenities);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Amenities & Verified Features
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {entries.map(([key, value]) => {
          const label = formatAmenityLabel(key);

          // 1. Boolean True
          if (typeof value === "boolean" && value === true) {
            return (
              <div
                key={key}
                className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-xs font-medium text-foreground transition-colors"
              >
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3 stroke-[2.5]" />
                </div>
                <span className="truncate">{label}</span>
              </div>
            );
          }

          // 2. Boolean False
          if (typeof value === "boolean" && value === false) {
            return (
              <div
                key={key}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/10 px-3.5 py-2.5 text-xs text-muted-foreground/70"
              >
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <X className="size-3" />
                </div>
                <span className="line-through truncate">{label}</span>
              </div>
            );
          }

          // 3. String value (e.g. Room Type: "2-Seater", Mess: "3-Time Included")
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-xs font-medium text-foreground"
            >
              <span className="text-muted-foreground truncate">{label}</span>
              <span className="font-semibold text-primary shrink-0">{String(value)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ListingAmenitiesList;

