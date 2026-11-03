import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Sparkles,
  MapPin,
  FolderTree,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "../types";

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  const cards = [
    {
      title: "Pending Approvals",
      value: stats.pendingListings,
      description: "Requires admin review",
      href: "/admin/listings?status=pending",
      icon: Clock,
      iconClass: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      accent: stats.pendingListings > 0,
    },
    {
      title: "Active Listings",
      value: stats.activeListings,
      description: "Live on directory",
      href: "/admin/listings?status=approved",
      icon: CheckCircle2,
      iconClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      accent: false,
    },
    {
      title: "Featured Listings",
      value: stats.featuredListings,
      description: "Promoted businesses",
      href: "/admin/listings?status=approved&featured=true",
      icon: Sparkles,
      iconClass: "text-primary bg-primary/10",
      accent: false,
    },
    {
      title: "Areas Covered",
      value: stats.activeAreas,
      description: "Active Bahawalpur zones",
      href: "/admin/areas",
      icon: MapPin,
      iconClass: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
      accent: false,
    },
    {
      title: "Total Categories",
      value: stats.totalCategories,
      description: "Business classifications",
      href: "/admin/categories",
      icon: FolderTree,
      iconClass: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const IconComponent = card.icon;

        return (
          <Link
            key={card.title}
            href={card.href}
            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
          >
            <Card className="h-full border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md cursor-pointer">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${card.iconClass}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted-foreground">
                  <span>{card.description}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
