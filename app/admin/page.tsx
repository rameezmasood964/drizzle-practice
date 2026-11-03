import { getDashboardData } from "@/modules/dashboard/queries";
import { PendingAlertBanner } from "@/modules/dashboard/components/PendingAlertBanner";
import { DashboardStatsCards } from "@/modules/dashboard/components/DashboardStatsCards";
import { RecentSubmissionsTable } from "@/modules/dashboard/components/RecentSubmissionsTable";
import { CategoryBreakdown } from "@/modules/dashboard/components/CategoryBreakdown";
import { QuickActions } from "@/modules/dashboard/components/QuickActions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { stats, recentListings, categoryBreakdown } =
    await getDashboardData();

  return (
    <div className="space-y-6 p-6">
      {/* Header & Quick Action Shortcuts */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Directory Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Live business metrics, pending location reviews, and recent activity
            across Bahawalpur.
          </p>
        </div>

        <QuickActions />
      </div>

      {/* Conditional Pending Verification Alert */}
      <PendingAlertBanner pendingCount={stats.pendingListings} />

      {/* KPI Top Stat Cards */}
      <DashboardStatsCards stats={stats} />

      {/* Grid: Recent Submissions + Category Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentSubmissionsTable listings={recentListings} />
        </div>
        <div className="lg:col-span-2">
          <CategoryBreakdown categories={categoryBreakdown} />
        </div>
      </div>
    </div>
  );
}