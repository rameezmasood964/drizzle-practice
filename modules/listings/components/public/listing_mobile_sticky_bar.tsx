import * as React from "react";
import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ListingMobileStickyBarProps {
  phone: string;
  whatsapp: string;
}

export function ListingMobileStickyBar({
  phone,
  whatsapp,
}: ListingMobileStickyBarProps) {
  const cleanWhatsAppNumber = whatsapp.replace(/[^0-9]/g, "");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 border-t border-border bg-background/95 p-3.5 backdrop-blur-md shadow-lg lg:hidden">
      {/* Call Button */}
      <Button
        variant="outline"
        size="lg"
        className="flex-1 gap-2 font-medium"
        asChild
      >
        <a href={`tel:${phone}`}>
          <Phone className="size-4 text-primary" />
          <span>Call</span>
        </a>
      </Button>

      {/* WhatsApp Button */}
      <Button
        size="lg"
        className="flex-1 gap-2 font-medium"
        asChild
      >
        <a
          href={`https://wa.me/${cleanWhatsAppNumber}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="size-4" />
          <span>WhatsApp</span>
        </a>
      </Button>
    </div>
  );
}

export default ListingMobileStickyBar;

