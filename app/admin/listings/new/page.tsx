// app/admin/listings/new/page.tsx

import AddListingForm from "@/modules/listings/components/admin/AddListingForm";
// 1. getAllCategoryFieldsMap import shamil kiya
import {
  getCategoriesWithSubcategories,
  getAllCategoryFieldsMap,
} from "@/modules/categories/queries";
import { getActiveAreas } from "@/modules/areas/queries";

const NewListingPage = async () => {
  // 2. Teeno queries ek sath parallel chalengi
  const [categories, areasResponse, categoryFieldsMap] = await Promise.all([
    getCategoriesWithSubcategories(),
    getActiveAreas(),
    getAllCategoryFieldsMap(),
  ]);

  const areas = areasResponse?.data || [];

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      {/* 3. categoryFieldsMap prop pass kar diya */}
      <AddListingForm
        categories={categories}
        areas={areas}
        categoryFieldsMap={categoryFieldsMap}
      />
    </main>
  );
};

export default NewListingPage;
