import Link from "next/link";
import { Plus, MapPin, FolderTree, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  const actions = [
    {
      label: "Add Listing",
      href: "/admin/listings/new",
      icon: Plus,
      variant: "default" as const,
      description: "Register new business",
    },
    {
      label: "Manage Categories",
      href: "/admin/categories",
      icon: FolderTree,
      variant: "outline" as const,
      description: "Add sectors or fields",
    },
    {
      label: "Manage Areas",
      href: "/admin/areas",
      icon: MapPin,
      variant: "outline" as const,
      description: "Towns & localities",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {actions.map((act) => {
        const IconComponent = act.icon;
        return (
          <Button
            key={act.label}
            asChild
            variant={act.variant}
            size="sm"
            className="cursor-pointer gap-1.5 h-9"
          >
            <Link href={act.href}>
              <IconComponent className="h-4 w-4" />
              <span>{act.label}</span>
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
