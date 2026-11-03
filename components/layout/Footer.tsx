import * as React from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

const EXPLORE_LINKS = [
  { label: "All Listings", href: "/explore" },
  { label: "Browse Categories", href: "/categories" },
  { label: "Boys & Girls Hostels", href: "/explore?category=hostels-accommodation" },
  { label: "Doctors & Clinics", href: "/explore?category=doctors-clinics" },
  { label: "Food & Cafes", href: "/explore?category=food-cafes" },
];

const POPULAR_AREA_LINKS = [
  { label: "Satellite Town", href: "/explore?area=satellite-town" },
  { label: "Model Town A/B", href: "/explore?area=model-town" },
  { label: "Bahawalpur Cantt", href: "/explore?area=cantt" },
  { label: "Circular Road", href: "/explore?area=circular-road" },
  { label: "IUB Baghdad Campus", href: "/explore?area=iub-campus" },
];

const BUSINESS_SUPPORT_LINKS = [
  { label: "+ List Your Business", href: "/admin/listings/new" },
  { label: "Verification Badge", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact Support", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                apna<span className="text-primary">Bwp</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Bahawalpur's smart verified local directory for hostels, clinics, food,
              and businesses.
            </p>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-xs">
              <MapPin className="size-3.5 text-primary" />
              <span>Bahawalpur, Punjab</span>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Popular Areas */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
              Popular Areas
            </h3>
            <ul className="space-y-2 text-sm">
              {POPULAR_AREA_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: For Business & Support */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
              For Business
            </h3>
            <ul className="space-y-2 text-sm">
              {BUSINESS_SUPPORT_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} apnaBwp. All rights reserved.</p>
          <p>Made for Bahawalpur residents & students.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

