import * as React from "react";
import Link from "next/link";
import { Sparkles, Plus, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRUST_PERKS = [
  "Verified badge credibility",
  "Direct Call & WhatsApp inquiries",
  "No technical setup required",
];

export function CtaBannerSection() {
  return (
    <section className="bg-background py-14 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-card to-primary/5 p-8 shadow-lg shadow-primary/5 md:p-12 lg:p-14">
          {/* Subtle Ambient Glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 -z-10 size-72 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="max-w-3xl space-y-5">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-xs">
              <Sparkles className="size-3.5 text-primary" />
              <span>Business Onboarding</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Own a Business, Clinic, or Hostel in Bahawalpur?
            </h2>

            {/* Sub-headline */}
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
              Hazaron local residents aur students tak pohnchein. Apni dukan ya
              service 2 minute mein list karein aur verified badge hasil karein.
            </p>

            {/* Inline Trust Perks */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs sm:text-sm font-medium text-foreground">
              {TRUST_PERKS.map((perk) => (
                <div key={perk} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
              <Button size="lg" asChild className="h-11 gap-2 rounded-xl px-6">
                <Link href="/admin/listings/new">
                  <Plus className="size-4" />
                  <span>Register Your Business</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-11 gap-2 rounded-xl px-6"
              >
                <Link href="/about">
                  <span>Learn How It Works</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaBannerSection;

