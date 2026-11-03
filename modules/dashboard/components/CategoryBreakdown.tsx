import Link from "next/link";
import { FolderTree, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CategoryBreakdownItem } from "../types";

interface CategoryBreakdownProps {
  categories: CategoryBreakdownItem[];
}

export function CategoryBreakdown({
  categories = [],
}: CategoryBreakdownProps) {
  return (
    <Card className="border border-border bg-card shadow-sm flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-primary" />
              <span>Category Distribution</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Top business sectors by listing volume.
            </p>
          </div>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <span>All Categories</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {categories.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
              No category data available yet.
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.categoryId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {cat.categoryName}
                  </span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {cat.listingCount}{" "}
                      {cat.listingCount === 1 ? "listing" : "listings"}
                    </span>
                    <span>({cat.percentage}%)</span>
                  </div>
                </div>
                <Progress value={cat.percentage} max={100} className="h-2" />
              </div>
            ))
          )}
        </CardContent>
      </div>

      <CardFooter className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground bg-muted/20">
        Categorization helps visitors find Bahawalpur businesses faster.
      </CardFooter>
    </Card>
  );
}
