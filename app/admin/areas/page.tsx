import AreasTable from "@/modules/areas/components/admin/AreasTable";
import { getAdminAreas } from "@/modules/areas/queries";
import { MapPin } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function AreasAdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params?.search?.trim() || "";
  const page = Math.max(1, Number(params?.page) || 1);
  const limit = 10;

  const result = await getAdminAreas({ search, page, limit });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Areas Management
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Bahawalpur ke authorized areas, towns aur mohalle manage karein.
        </p>
      </div>

      <AreasTable
        areas={result.data || []}
        pagination={{
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          limit: result.limit,
        }}
        searchQuery={search}
      />
    </div>
  );
}
