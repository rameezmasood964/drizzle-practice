import CategoryFields from "@/modules/categories/components/admin/CategoryFields";
import { getCategoryById } from "@/modules/categories/queries";
import { getCategoryFields } from "@/modules/categories/queries";
import { getCategoryFieldsWithInheritance } from "@/modules/categories/queries";
import { notFound } from "next/navigation";
interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  // 1. URL se id nikal kar integer banayein
  const { id } = await params;
  const categoryId = parseInt(id, 10);

  // Agar ID number nahi hai to 404 show karein
  if (isNaN(categoryId)) {
    notFound();
  }

  // 2. Database se is category ka record le kar aayein
  const category = await getCategoryById(categoryId);
  const categoryField = await getCategoryFieldsWithInheritance(categoryId);

  // Agar category exist nahi karti to 404
  if (!category) {
    notFound();
  }

  return (
    <div className="p-6">
      <CategoryFields
        categoryId={category.id}
        categoryName={category.name}
        initialFields={categoryField}
      />
    </div>
  );
};

export default Page;
