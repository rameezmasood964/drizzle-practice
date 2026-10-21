"use client";

import { Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const ContactSection = () => {
  return (
    <Card className="border-border bg-card shadow-sm">
      {/* Section Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Phone className="h-4 w-4 text-primary" />
          Contact Details
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Row 1: Phone Number & WhatsApp Number */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="03001234567"
              className="bg-background"
            />
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp" className="text-sm font-medium">
              WhatsApp Number
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+92 300 1234567"
              className="bg-background"
            />
          </div>
        </div>

        {/* Row 2: Email & Website */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="info@business.com"
              className="bg-background"
            />
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <Label htmlFor="website" className="text-sm font-medium">
              Website <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://www.example.com"
              className="bg-background"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ContactSection
