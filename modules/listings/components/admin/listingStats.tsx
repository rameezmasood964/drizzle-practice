import { FileText, CheckCircle2, Clock, FileEdit, Ban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ListingStatsProps } from "../../types";

const ListingStats = ({
  total = 0,
  approved = 0,
  pending = 0,
  draft = 0,
  rejected = 0,
}: ListingStatsProps) => {
  const statsList = [
    {
      title: "Total Listings",
      value: total,
      icon: FileText,
      iconContainerClass: "bg-muted text-muted-foreground",
    },
    {
      title: "Approved",
      value: approved,
      icon: CheckCircle2,
      iconContainerClass: "bg-primary/10 text-primary",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock,
      iconContainerClass: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Drafts",
      value: draft,
      icon: FileEdit,
      iconContainerClass: "bg-muted text-muted-foreground",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: Ban,
      iconContainerClass: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {statsList.map((stat) => {
        const IconComponent = stat.icon;

        return (
          <Card key={stat.title} className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.iconContainerClass}`}
              >
                <IconComponent className="h-5 w-5" />
              </div>

              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {stat.title}
                </p>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ListingStats;
