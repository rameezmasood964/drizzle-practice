import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import type { RecentListingItem } from "../types";

interface RecentSubmissionsTableProps {
  listings: RecentListingItem[];
}

export function RecentSubmissionsTable({
  listings = [],
}: RecentSubmissionsTableProps) {
  const getBadgeStyle = (status: RecentListingItem["status"]) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "rejected":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">
            Recent Submissions
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest 5 business listings added to the platform.
          </p>
        </div>
        <Link
          href="/admin/listings"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <span>View All</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-2.5 text-xs font-semibold">
                  Listing
                </TableHead>
                <TableHead className="py-2.5 text-xs font-semibold">
                  Category
                </TableHead>
                <TableHead className="py-2.5 text-xs font-semibold">
                  Area
                </TableHead>
                <TableHead className="py-2.5 text-xs font-semibold">
                  Date
                </TableHead>
                <TableHead className="py-2.5 text-xs font-semibold text-right">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {listings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-xs text-muted-foreground"
                  >
                    No listings found yet.
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="py-3 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/listings/${item.id}/edit`}
                          className="hover:underline font-medium text-foreground text-sm line-clamp-1 max-w-[180px]"
                        >
                          {item.title}
                        </Link>
                        {item.isFeatured && (
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 shrink-0" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs text-muted-foreground">
                      <Badge variant="outline" className="font-normal text-xs">
                        {item.categoryName || "Uncategorized"}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {item.areaName || "-"}
                    </TableCell>

                    <TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      <Badge
                        variant="outline"
                        className={`capitalize font-medium text-xs ${getBadgeStyle(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs bg-muted/20">
        <span className="text-muted-foreground">
          Showing {listings.length} most recent entries
        </span>
        <Link
          href="/admin/listings"
          className="font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          <span>Open Listings Manager</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
