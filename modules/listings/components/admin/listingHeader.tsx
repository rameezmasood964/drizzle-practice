import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ListingHeaderProps } from "../../types";

const ListingHeader = ({
  title = "Listings",
  description = "Manage all business listings, verifications, and approvals.",
}: ListingHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Primary Action Button */}
      <Button asChild className="gap-2">
        <Link href="/admin/listings/new">
          <Plus className="h-4 w-4" />
          <span>Add Listing</span>
        </Link>
      </Button>
    </div>
  );
};

export default ListingHeader;
