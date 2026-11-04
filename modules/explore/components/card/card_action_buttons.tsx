"use client";

import * as React from "react";
import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CardActionButtonsProps {
  phone: string;
  whatsapp: string;
}

export function CardActionButtons({ phone, whatsapp }: CardActionButtonsProps) {
  const cleanWhatsAppNumber = React.useMemo(() => {
    return whatsapp.replace(/[^0-9]/g, "");
  }, [whatsapp]);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://wa.me/${cleanWhatsAppNumber}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid grid-cols-2 gap-2 border-t border-border/80 bg-muted/20 p-3">
      {/* Call Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCall}
        className="h-8 gap-1.5 text-xs font-medium"
      >
        <Phone className="size-3.5" />
        <span>Call</span>
      </Button>

      {/* WhatsApp Button */}
      <Button
        type="button"
        size="sm"
        onClick={handleWhatsApp}
        className="h-8 gap-1.5 text-xs font-medium"
      >
        <MessageCircle className="size-3.5" />
        <span>WhatsApp</span>
      </Button>
    </div>
  );
}

export default CardActionButtons;

