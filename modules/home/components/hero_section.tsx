"use client";

import * as React from "react";
import { Search, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const POPULAR_AREAS = [
  { value: "all", label: "All Bahawalpur" },
  { value: "model-town-a", label: "Model Town A" },
  { value: "model-town-b", label: "Model Town B" },
  { value: "cantt", label: "Bahawalpur Cantt" },
  { value: "satellite-town", label: "Satellite Town" },
  { value: "dubai-mahal-road", label: "Dubai Mahal Road" },
  { value: "iub-campus", label: "Baghdad-ul-Jadeed (IUB)" },
  { value: "one-unit", label: "One Unit Staff Colony" },
  { value: "circular-road", label: "Circular Road" },
];

const TRENDING_TAGS = [
  "#BoysHostels",
  "#GirlsHostels",
  "#FastFood",
  "#Clinics",
  "#Gyms",
];

export function HeroSection() {
  const [selectedArea, setSelectedArea] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const handleTagClick = (tag: string) => {
    // Strip hash and set into search query
    setSearchQuery(tag.replace("#", ""));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Visual presentation only
  };

  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-16 sm:py-24 md:py-28 lg:py-32">
      {/* Subtle Background Glow/Gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(var(--primary-rgb,120,120,120),0.08),transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-background"
        aria-hidden="true"
      />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Top Badge / Pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1.5 text-xs font-medium text-foreground shadow-xs backdrop-blur-xs transition-colors hover:bg-muted sm:text-sm">
            <Sparkles className="size-3.5 text-primary" />
            <span>Bahawalpur's Smart Local Directory</span>
          </div>

          {/* Main Headline */}
          <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Find Hostels, Doctors, Food & Shops in{" "}
            <span className="text-primary">Bahawalpur</span>
          </h1>

          {/* Sub-headline */}
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            Shehar ki verified aur behtareen jaghein ek jagah
          </p>

          {/* Unified Search Container (Card/Pill style) */}
          <form
            onSubmit={handleSearch}
            className="mt-8 w-full max-w-3xl rounded-2xl border border-border bg-card p-2 shadow-lg shadow-primary/5 backdrop-blur-sm sm:p-2.5"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0">
              {/* Select Area */}
              <div className="flex flex-1 items-center gap-2 px-3 py-1">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger
                    className="h-10 w-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 data-placeholder:text-muted-foreground"
                    aria-label="Select Area"
                  >
                    <SelectValue placeholder="Select Area (e.g. Model Town, Cantt)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {POPULAR_AREAS.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Divider */}
              <div
                className="hidden h-7 w-px bg-border md:block"
                aria-hidden="true"
              />

              {/* Mobile Divider */}
              <div
                className="border-t border-border/60 md:hidden"
                aria-hidden="true"
              />

              {/* Search Keyword Input */}
              <div className="flex flex-[1.4] items-center gap-2 px-3 py-1">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you looking for? (Hostels, Clinics, Cafes...)"
                  className="h-10 border-0 bg-transparent p-0 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>

              {/* Search Action Button */}
              <Button
                type="submit"
                size="lg"
                className="h-11 w-full gap-2 rounded-xl font-medium md:w-auto md:px-7"
              >
                <Search className="size-4" />
                <span>Search</span>
              </Button>
            </div>
          </form>

          {/* Quick Trending Tags */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
            <span className="font-medium text-muted-foreground">
              Popular Searches:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {TRENDING_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  onClick={() => handleTagClick(tag)}
                  className={cn(
                    "cursor-pointer rounded-full px-3 py-1 font-normal text-muted-foreground transition-all duration-200",
                    "hover:border-primary/50 hover:bg-accent hover:text-foreground",
                    searchQuery === tag.replace("#", "") &&
                      "border-primary bg-primary/10 text-primary font-medium"
                  )}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
