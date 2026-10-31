// app/admin/listings/new/page.tsx (ya jahan aapka route page hai)

import AddListingForm from "@/modules/listings/components/admin/AddListingForm";
import { getCategoriesWithSubcategories } from "@/modules/categories/queries";
import { getActiveAreas } from "@/modules/areas/queries";

const NewListingPage = async () => {
  // Parallel fetch: dono database queries ek sath run hongi
  const [categories, areasResponse] = await Promise.all([
    getCategoriesWithSubcategories(),
    getActiveAreas(),
  ]);

  // getActiveAreas se array extract karein
  const areas = areasResponse?.data || [];

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <AddListingForm categories={categories} areas={areas} />
    </main>
  );
};

export default NewListingPage;