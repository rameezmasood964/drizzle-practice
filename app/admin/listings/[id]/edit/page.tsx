import { notFound } from "next/navigation";
import AddListingForm from "@/modules/listings/components/admin/AddListingForm";
import { getListingById } from "@/modules/listings/queries";
import {
  getCategoriesWithSubcategories,
  getAllCategoryFieldsMap,
} from "@/modules/categories/queries";
import { getActiveAreas } from "@/modules/areas/queries";

interface EditListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditListingPage = async ({ params }: EditListingPageProps) => {
  const resolvedParams = await params;
  const listingId = Number(resolvedParams.id);

  if (isNaN(listingId)) {
    notFound();
  }

  // Listing data aur supporting dropdowns parallel fetch karein
  const [listing, categories, areasResponse, categoryFieldsMap] =
    await Promise.all([
      getListingById(listingId),
      getCategoriesWithSubcategories(),
      getActiveAreas(),
      getAllCategoryFieldsMap(),
    ]);
  console.log("FETCHED LISTING IMAGES:", listing?.images);

  if (!listing) {
    notFound();
  }

  const areas = areasResponse?.data || [];

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Edit Listing
        </h1>
        <p className="text-sm text-muted-foreground">
          Update listing details for &quot;{listing.title}&quot;
        </p>
      </div>

      <AddListingForm
        categories={categories}
        areas={areas}
        categoryFieldsMap={categoryFieldsMap}
        initialData={listing}
        isEditing={true}
      />
    </main>
  );
};

export default EditListingPage;
