import ListingsDashboardWrapper from "@/modules/listings/components/admin/ListingsDashboardWrapper";
import { getAdminListings, getListingStats } from "@/modules/listings/queries";
import { getAllCategoryFieldsMap, getRootCategories } from "@/modules/categories/queries";
import { getAreasDropdown } from "@/modules/areas/queries";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: "draft" | "pending" | "approved" | "rejected" | "incomplete";
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

  // 1. Parallel data fetching with resilient error boundaries
  const [listingsResult, stats, categoriesList, areasList, categoryFieldsMap] =
    await Promise.all([
      getAdminListings({
        search: params.search,
        status: params.status,
        categoryId: params.categoryId ? Number(params.categoryId) : undefined,
        areaId: params.areaId ? Number(params.areaId) : undefined,
        limit,
        offset,
      }),
      getListingStats(),
      getRootCategories(),
      getAreasDropdown(),
      getAllCategoryFieldsMap(),
    ]);

  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <ListingsDashboardWrapper
        stats={stats}
        listings={listingsResult.data}
        categories={categoriesList}
        areas={areasList} // 👈 areasList pass karein
        categoryFieldsMap={categoryFieldsMap}
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
