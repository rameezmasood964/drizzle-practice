

import CategoryTable from "@/modules/categories/components/admin/CategoryTable"
import AddCategoryForm from "@/modules/categories/components/admin/AddCategoryForm"
import { getCategories } from "@/modules/categories/queries"

const CategoriesPage =  async () => {
  const categories = await getCategories();
  console.log("categories ka data categories page mein", categories)
  return (
    <div className="p-6">
   
      <CategoryTable categories = {categories} />
      
      
      
    </div>
  )
}

export default CategoriesPage