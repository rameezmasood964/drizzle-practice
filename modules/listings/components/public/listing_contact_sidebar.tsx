import * as React from "react";
import { Phone, MessageCircle, Clock, UserCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ListingContactSidebarProps {
  price: string;
  managerName?: string;
  phone: string;
  whatsapp: string;
  timings?: string;
}

export function ListingContactSidebar({
  price,
  managerName = "Administration",
  phone,
  whatsapp,
  timings = "Open Daily • 9:00 AM - 10:00 PM",
}: ListingContactSidebarProps) {
  const cleanWhatsAppNumber = whatsapp.replace(/[^0-9]/g, "");

  return (
    <aside className="sticky top-24 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Price Header */}
      <div className="space-y-1 border-b border-border pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Starting From / Pricing
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-foreground">
            {price}
          </span>
        </div>
      </div>

      {/* Verified Manager / Owner Info */}
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserCheck className="size-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-xs text-muted-foreground">Verified Contact</span>
          <h4 className="text-sm font-semibold text-foreground">{managerName}</h4>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Call Now Button */}
        <Button
          size="lg"
          variant="outline"
          className="w-full gap-2 font-medium"
          asChild
        >
          <a href={`tel:${phone}`}>
            <Phone className="size-4 text-primary" />
            <span>Call Now ({phone})</span>
          </a>
        </Button>

        {/* WhatsApp Message Button */}
        <Button
          size="lg"
          className="w-full gap-2 font-medium"
          asChild
        >
          <a
            href={`https://wa.me/${cleanWhatsAppNumber}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="size-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </Button>
      </div>

      {/* Visiting Timings Hint */}
      <div className="space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 text-primary shrink-0" />
          <span>{timings}</span>
        </div>
        <div className="flex items-center gap-2 text-foreground/80">
          <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Verified listing on apnaBwp Directory</span>
        </div>
      </div>
    </aside>
  );
}

export default ListingContactSidebar;

