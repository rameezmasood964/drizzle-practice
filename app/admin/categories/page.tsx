import CategoryTable from "@/modules/categories/components/admin/CategoryTable";
import { getCategories } from "@/modules/categories/queries";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

const CategoriesPage = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const search = params?.search?.trim() || "";
  const page = Math.max(1, Number(params?.page) || 1);
  const limit = 10;

  const result = await getCategories({ search, page, limit });

  return (
    <div className="p-6">
      <CategoryTable
        categories={result.data}
        allCategories={result.allCategories}
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
};

export default CategoriesPage;
