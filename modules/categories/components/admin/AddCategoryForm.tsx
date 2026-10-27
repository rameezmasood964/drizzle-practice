// "use client";

// import { Input } from "@/components/ui/input";
// import { useActionState } from "react";
// import { toast } from "sonner";

// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import { addcategory } from "../../actions";
// import { useEffect } from "react";

// import { CategoryFormProps } from "../../types";
// import { formatCategoryTree } from "../../utils";

// const CategoryForm = ({ onSuccess,categories }: CategoryFormProps) => {

//   // 2. Categories ko tree format mein convert karein
//   const formattedCategories = formatCategoryTree(categories);
//   const [state, formAction, isPending] = useActionState(addcategory, null);

//   useEffect(() => {
//   if (state?.success) {
//     toast.success(state.message || "Category added successfully!");
//     onSuccess?.();

//     // "Message HAI ✅ AUR Errors NAHI hain ✅ mean agr error ni ha to global errro ha naky singlee"
//   } else if (state?.message && !state?.errors) {
//     // sirf general errors ka toast, field errors ka nahi
//     toast.error(state.message);
//   }
// }, [state, onSuccess]);

//   return (
//     <form className="space-y-4 py-2" action={formAction}>

//       {/* Category Name Field */}
//       <div className="space-y-2">
//         <Label htmlFor="name">Category Name</Label>
//         <Input
//           id="name"
//           name="name"
//           type="text"
//           placeholder="e.g. Hostels or Doctor"
//           defaultValue={String(state?.inputs?.name || "")}
//         />

//         {/* Field-level error for name */}
//         {state?.errors?.name && (
//           <p className="text-xs text-destructive font-medium">
//             {state.errors.name[0]}
//           </p>
//         )}
//       </div>

//       {/* Slug Field */}
//       <div className="space-y-2">
//         <Label htmlFor="slug">Slug</Label>
//         <Input
//           id="slug"
//           name="slug"
//           type="text"
//           placeholder="e.g. hostels"
//           defaultValue={String(state?.inputs?.slug || "")}
//         />

//         {/* Field-level error for slug */}
//         {state?.errors?.slug && (
//           <p className="text-xs text-destructive font-medium">
//             {state.errors.slug[0]}
//           </p>
//         )}
//       </div>

//       {/* icon field  */}

//       <div className="space-y-2">
//         <Label htmlFor="icon">Category Icon (Required)</Label>
//         <Input
//           id="icon"
//           name="icon"
//           type="file"
//           accept="image/*"
//           className="cursor-pointer"
//         />

//         {/* Field-level error for icon */}
//         {state?.errors?.icon && (
//           <p className="text-xs text-destructive font-medium">
//             {state.errors.icon[0]}
//           </p>
//         )}
//       </div>

//       {/* Parent Category Select */}
//       <div className="space-y-2">
//         <Label htmlFor="parent">Parent Category</Label>
//         <Select
//           name="parentId"
//           defaultValue={String(state?.inputs?.parentId || "0")}
//         >
//           <SelectTrigger id="parent" className="w-full cursor-pointer">
//             <SelectValue placeholder="Select parent category" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="0">None (Root Category)</SelectItem>

//           {formattedCategories.map((cat) => (
//            <SelectItem key={cat.id} value={String(cat.id)}>
//               {cat.name}
//               </SelectItem>
//   ))}
//           </SelectContent>
//         </Select>

//         {/* Field-level error for parentId */}
//         {state?.errors?.parentId && (
//           <p className="text-xs text-destructive font-medium">
//             {state.errors.parentId[0]}
//           </p>
//         )}
//       </div>

//       {/* Submit Button */}
//       <div className="pt-2">
//         <Button type="submit" disabled={isPending}>
//           {isPending ? "Adding Category..." : "Add Category"}
//         </Button>
//       </div>
//     </form>
//   );
// };

// export default CategoryForm;

// "use client";

// import { Input } from "@/components/ui/input";
// import { useActionState } from "react";
// import { toast } from "sonner";

// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import { addcategory, updatecategory } from "../../actions";
// import { useEffect } from "react";
// import { formatCategoryTree } from "../../utils";

// // Types ko apne hisaab se extend kiya hai taake initialData support mil sake
// interface CategoryFormProps {
//   onSuccess?: () => void;
//   categories: any[];
//   initialData?: any; // Edit ke liye purana data
// }

// const CategoryForm = ({ onSuccess, categories, initialData }: CategoryFormProps) => {
//   const isEditing = !!initialData; // Check karne ke liye ke hum Edit mode mein hain ya Add mode

//   // Agar edit mode hai toh updatecategory action chalega, warna addcategory
//   const actionToRun = isEditing ? updatecategory : addcategory;

//   const formattedCategories = formatCategoryTree(categories);
//   const [state, formAction, isPending] = useActionState(actionToRun as any, null);

//   useEffect(() => {
//     if (state?.success) {
//       toast.success(state.message || (isEditing ? "Category updated successfully!" : "Category added successfully!"));
//       onSuccess?.();
//     } else if (state?.message && !state?.errors) {
//       toast.error(state.message);
//     }
//   }, [state, onSuccess, isEditing]);

//   return (
//     <form className="space-y-4 py-2" action={formAction}>

//       {/* Hidden Category ID for Edit Mode */}
//       {isEditing && (
//         <input type="hidden" name="id" value={initialData.id} />
//       )}

//       {/* Category Name Field */}
//       <div className="space-y-2">
//         <Label htmlFor="name">Category Name</Label>
//         <Input
//           id="name"
//           name="name"
//           type="text"
//           placeholder="e.g. Hostels or Doctor"
//           defaultValue={state?.inputs?.name || initialData?.name || ""}
//         />
//         {state?.errors?.name && (
//           <p className="text-xs text-destructive font-medium">
//             {state.errors.name[0]}
//           </p>
//         )}
//       </div>

//       {/* Slug Field */}
//       <div className="space-y-2">
//         <Label htmlFor="slug">Slug</Label>
//         <Input
//           id="slug"
//           name="slug"
//           type="text"
//           placeholder="e.g. hostels"
//           defaultValue={state?.inputs?.slug || initialData?.slug || ""}
//         />
//         {state?.errors?.slug && (
//           <p className="text-xs text-destructive font-medium">
//             {state.errors.slug[0]}
//           </p>
//         )}
//       </div>

//       {/* Icon Field */}
//       <div className="space-y-2">
//         <Label htmlFor="icon">
//           Category Icon {isEditing ? "(Optional)" : "(Required)"}
//         </Label>
//         <Input
//           id="icon"
//           name="icon"
//           type="file"
//           accept="image/*"
//           className="cursor-pointer"
//         />
//         {state?.errors?.icon && (
//           <p className="text-xs text-destructive font-medium">
//             {state.errors.icon[0]}
//           </p>
//         )}
//       </div>

//       {/* Parent Category Select */}
//       <div className="space-y-2">
//         <Label htmlFor="parent">Parent Category</Label>
//         <Select
//           name="parentId"
//           defaultValue={String(
//             state?.inputs?.parentId || initialData?.parentId || "0"
//           )}
//         >
//           <SelectTrigger id="parent" className="w-full cursor-pointer">
//             <SelectValue placeholder="Select parent category" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="0">None (Root Category)</SelectItem>

//             {formattedCategories
//               .filter((cat) => !isEditing || cat.id !== initialData.id) // Khud ko apna parent banne se rokne ke liye guard
//               .map((cat) => (
//                 <SelectItem key={cat.id} value={String(cat.id)}>
//                   {cat.name}
//                 </SelectItem>
//               ))}
//           </SelectContent>
//         </Select>
//         {state?.errors?.parentId && (
//           <p className="text-xs text-destructive font-medium">
//             {state.errors.parentId[0]}
//           </p>
//         )}
//       </div>

//       {/* Submit Button */}
//       <div className="pt-2">
//         <Button type="submit" disabled={isPending} className="cursor-pointer">
//           {isPending
//             ? (isEditing ? "Updating..." : "Adding Category...")
//             : (isEditing ? "Update Category" : "Add Category")}
//         </Button>
//       </div>
//     </form>
//   );
// };

// export default CategoryForm;

"use client";

import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { addcategory, updatecategory } from "../../actions/categories";
import { useEffect } from "react";
import { formatCategoryTree } from "../../utils";

interface CategoryFormProps {
  onSuccess?: () => void;
  categories: any[];
  initialData?: any;
}

const CategoryForm = ({
  onSuccess,
  categories,
  initialData,
}: CategoryFormProps) => {
  // !! iska mtlb data abhi skta h or ni bh askta
  const isEditing = !!initialData;
  const actionToRun = isEditing ? updatecategory : addcategory;

  const formattedCategories = formatCategoryTree(categories);
  
  const [state, formAction, isPending] = useActionState(
    actionToRun as any,
    null,
  );

  // State ko explicitly 'any' cast kar liya taake TypeScript error na de
  const formState = state as any;

  useEffect(() => {
    if (formState?.success) {
      toast.success(
        formState.message ||
          (isEditing
            ? "Category updated successfully!"
            : "Category added successfully!"),
      );
      onSuccess?.();
    } else if (formState?.message && !formState?.errors) {
      toast.error(formState.message);
    }
  }, [formState, onSuccess, isEditing]);

  return (
    <form className="space-y-4 py-2" action={formAction}>
      {/* Hidden Category ID for Edit Mode */}
      {isEditing && <input type="hidden" name="id" value={initialData.id} />}

      {/* Category Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Hostels or Doctor"
          defaultValue={formState?.inputs?.name || initialData?.name || ""}
        />
        {formState?.errors?.name && (
          <p className="text-xs text-destructive font-medium">
            {formState.errors.name[0]}
          </p>
        )}
      </div>

      {/* Slug Field */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          type="text"
          placeholder="e.g. hostels"
          defaultValue={formState?.inputs?.slug || initialData?.slug || ""}
        />
        {formState?.errors?.slug && (
          <p className="text-xs text-destructive font-medium">
            {formState.errors.slug[0]}
          </p>
        )}
      </div>

      {/* Icon Field */}
      <div className="space-y-2">
        <Label htmlFor="icon">
          Category Icon {isEditing ? "(Optional)" : "(Required)"}
        </Label>
        <Input
          id="icon"
          name="icon"
          type="file"
          accept="image/*"
          className="cursor-pointer"
        />
        {formState?.errors?.icon && (
          <p className="text-xs text-destructive font-medium">
            {formState.errors.icon[0]}
          </p>
        )}
      </div>

      {/* Parent Category Select */}
      <div className="space-y-2">
        <Label htmlFor="parent">Parent Category</Label>
        <Select
          name="parentId"
          defaultValue={String(
            formState?.inputs?.parentId || initialData?.parentId || "0",
          )}
        >
          <SelectTrigger id="parent" className="w-full cursor-pointer">
            <SelectValue placeholder="Select parent category" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="0">None (Root Category)</SelectItem>

            {formattedCategories
              .filter((cat) => !isEditing || cat.id !== initialData.id)
              .map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {formState?.errors?.parentId && (
          <p className="text-xs text-destructive font-medium">
            {formState.errors.parentId[0]}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button type="submit" disabled={isPending} className="cursor-pointer">
          {isPending
            ? isEditing
              ? "Updating..."
              : "Adding Category..."
            : isEditing
              ? "Update Category"
              : "Add Category"}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
