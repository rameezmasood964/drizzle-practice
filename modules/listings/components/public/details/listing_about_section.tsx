import * as React from "react";
import { Clock } from "lucide-react";

export interface ListingAboutSectionProps {
  description: string;
  timings: string;
  category: string;
}

export function ListingAboutSection({
  description,
  timings,
  category,
}: ListingAboutSectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
      <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
        About This {category}
      </h2>

      {/* Description Paragraph */}
      <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
        {description}
      </div>

      {/* Operating / Visit Timings Card */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Clock className="size-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Operating / Visiting Hours
          </span>
          <p className="text-sm font-medium text-foreground">{timings}</p>
        </div>
      </div>
    </section>
  );
}

export default ListingAboutSection;

