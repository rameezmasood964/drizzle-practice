import CategoryFields from "@/modules/categories/components/admin/CategoryFields";
import {
  getCategoryByIdOrSlug,
  getCategoryFieldsWithInheritance,
  getCategoriesHierarchy,
} from "@/modules/categories/queries";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  // 1. URL se identifier (slug ya ID) nikal kar category resolve karein
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const category = await getCategoryByIdOrSlug(id);

  // Agar category exist nahi karti to 404 show karein
  if (!category) {
    notFound();
  }

  // 2. Database se is category ke fields aur full hierarchy le kar aayein
  const [categoryField, categoriesHierarchy] = await Promise.all([
    getCategoryFieldsWithInheritance(category.id),
    getCategoriesHierarchy(),
  ]);

  return (
    <div className="p-6">
      <CategoryFields
        categoryId={category.id}
        categoryName={category.name}
        initialFields={categoryField}
        categoriesHierarchy={categoriesHierarchy}
      />
    </div>
  );
};

export default Page;
