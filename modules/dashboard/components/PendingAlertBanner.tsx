import Link from "next/link";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingAlertBannerProps {
  pendingCount: number;
}

export function PendingAlertBanner({ pendingCount }: PendingAlertBannerProps) {
  if (pendingCount === 0) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-card-foreground">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Action Required: Pending Verification
          </p>
          <p className="text-xs text-muted-foreground">
            You have{" "}
            <span className="font-bold text-amber-700 dark:text-amber-400">
              {pendingCount}
            </span>{" "}
            {pendingCount === 1 ? "listing" : "listings"} waiting for manual
            location and detail review.
          </p>
        </div>
      </div>

      <Button
        asChild
        size="sm"
        className="shrink-0 gap-1.5 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-black dark:hover:bg-amber-400 font-medium"
      >
        <Link href="/admin/listings?status=pending">
          <span>Review Now</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
