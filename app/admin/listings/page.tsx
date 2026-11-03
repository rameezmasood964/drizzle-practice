import ListingsDashboardWrapper from "@/modules/listings/components/admin/ListingsDashboardWrapper";
import { getAdminListings, getListingStats } from "@/modules/listings/queries";
import { db } from "@/db";
import { categories, areas } from "@/db/schema"; // 👈 areas import karein
import { isNull, asc } from "drizzle-orm";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: "draft" | "pending" | "approved" | "rejected";
    categoryId?: string;
    areaId?: string; // 👈 areaId param add kiya
    page?: string;
  }>;
}

const ListingsPage = async ({ searchParams }: PageProps) => {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // 1. Parallel data fetching
  const [listingsResult, stats, categoriesList, areasList] = await Promise.all([
    getAdminListings({
      search: params.search,
      status: params.status,
      categoryId: params.categoryId ? Number(params.categoryId) : undefined,
      areaId: params.areaId ? Number(params.areaId) : undefined, // 👈 query ko areaId pass karein
      limit,
      offset,
    }),
    getListingStats(),
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(isNull(categories.parentId)),
    db
      .select({ id: areas.id, name: areas.name })
      .from(areas)
      .orderBy(asc(areas.name)), // 👈 Areas fetch query
  ]);

  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <ListingsDashboardWrapper
        stats={stats}
        listings={listingsResult.data}
        categories={categoriesList}
        areas={areasList} // 👈 areasList pass karein
        pagination={{
          currentPage: page,
          totalPages: listingsResult.totalPages,
          totalCount: listingsResult.totalCount,
        }}
      />
    </div>
  );
};

export default ListingsPage;
