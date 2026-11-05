"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Plus, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "All Listings", href: "/explore" },
  { label: "Categories", href: "/categories" },
];

export function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo + Location Badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 transition-opacity hover:opacity-90"
          >
            <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              apna<span className="text-primary">Bwp</span>
            </span>
          </Link>

          {/* Location Chip */}
          <div className="hidden items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:inline-flex">
            <MapPin className="size-3 text-primary" />
            <span>Bahawalpur</span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions (Desktop) & Hamburger Trigger (Mobile) */}
        <div className="flex items-center gap-2.5">
          {/* Sign In Button (Desktop) */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex"
          >
            <Link href="/login">Sign In</Link>
          </Button>

          {/* Add Business Primary Button (Desktop) */}
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/admin/listings/new">
              <Plus className="size-4" />
              <span>List Your Business</span>
            </Link>
          </Button>

          {/* Mobile Navigation Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-6 p-6">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-foreground">
                    apna<span className="text-primary">Bwp</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    <MapPin className="size-3 text-primary" />
                    Bahawalpur
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Links */}
              <nav className="flex flex-col gap-1.5">
                {NAV_ITEMS.map((item) => {
                  const active = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2 text-base font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Actions */}
              <div className="mt-auto flex flex-col gap-2.5 border-t border-border pt-4">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  className="w-full justify-center"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/admin/listings/new">
                    <Plus className="size-4" />
                    <span>List Your Business</span>
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default NavBar;

