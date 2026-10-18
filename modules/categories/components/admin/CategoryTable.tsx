"use client";
import Link from "next/link";
import { MoreHorizontal, SlidersHorizontal, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CategoryForm from "./AddCategoryForm";
import { CategoryTableProps } from "../../types";
import { formatCategoryTree } from "../../utils";
import { deleteCategory } from "../../actions";

const CategoryTable = ({ categories }: CategoryTableProps) => {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Utility function se categories ko hierarchy order mein convert karein
  const formattedCategories = formatCategoryTree(categories);

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
      {/* Heading and Add/Edit Dialogs Container */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold tracking-tight">Categories</h2>

        {/* 1 dialog add category ka ............ */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">Add Category +</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>

            <CategoryForm
              onSuccess={() => setOpen(false)}
              categories={categories}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 2nd dialog editing category ka........  */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditingCategory(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          {editingCategory && (
            <CategoryForm
              initialData={editingCategory}
              onSuccess={() => {
                setIsEditOpen(false);
                setEditingCategory(null);
              }}
              categories={categories}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Shadcn Table start here ................. */}
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          {/* heading of table  */}
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="p-4 font-medium w-16">Icon</TableHead>
              <TableHead className="p-4 font-medium">Name</TableHead>
              <TableHead className="p-4 font-medium">Slug</TableHead>
              <TableHead className="p-4 font-medium">Parent Category</TableHead>
              <TableHead className="p-4 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>

          {/* body of table  */}
          <TableBody className="divide-y divide-border">
            {formattedCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center p-6 text-muted-foreground"
                >
                  No categories found. Add your first category!
                </TableCell>
              </TableRow>
            ) : (
              // yaha pr cat ky pas id, name, or level ha kion ky yeh formatcategorytree sy arha ha isliye
              //isliye  hm ny  map ky bad find lgya taky icon slug wgera nikal sky
              formattedCategories.map((cat) => {
                // "Hamare paas sirf ID thi jo formatCategoryTree se map ke paas aayi thi cat ky pas. Hum ne .find() lagaya aur kaha:
                //  'Asli categories mein jao, wahan har row ki c.id ko check karo, aur jaise hi tumhe cat.id mil jaye,
                // uska poora data (icon, slug, name) utha kar de do!'

                const originalCategory = categories.find(
                  (c) => c.id === cat.id,
                );

                // Mujhe originalCategory?.parentId se parent ki ID mil gayi hai (misal ke taur par ID 2).
                //  Ab jao asli categories wali list mein, aur wahan c.id ko is parentId ke sath match karo.
                //  Jaise hi match ho jaye, toh us parent category ka poora data (aur khas tor par uska naam)
                //  utha kar parentCategory mein save kar lo taake hum table mein dikha sakein ke yeh kis Root
                // ya Parent ke under hai!"
                const parentCategory = categories.find(
                  (c) => c.id === originalCategory?.parentId,
                );
                // "Dekho bhai, cat.level ki jo bhi value hai woh level mein daal do. Lekin,
                //  agar kisi waja se cat.level mojood na ho (yani wo undefined ya null ho)
                // , toh ghabrana mat, by default uski jagah 0 (zero) rakh dena!"
                const level = cat.level || 0;

                return (
                  <TableRow
                    key={cat.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {/* Icon Column */}
                    <TableCell className="p-4">
                      <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex items-center justify-center border border-border shrink-0">
                        {originalCategory?.icon ? (
                          <img
                            src={originalCategory.icon}
                            alt={originalCategory.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            📁
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Name with Dynamic Indentation */}
                    <TableCell className="p-4">
                      <div
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${level * 24}px` }}
                      >
                        {level > 0 && (
                          <span className="text-muted-foreground font-mono">
                            └──
                          </span>
                        )}
                        <span
                          className={
                            level === 0
                              ? "font-semibold text-foreground"
                              : "font-normal text-muted-foreground"
                          }
                        >
                          {originalCategory?.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Slug */}
                    <TableCell className="p-4 text-muted-foreground">
                      {originalCategory?.slug}
                    </TableCell>

                    {/* Parent Category Name */}
                    <TableCell className="p-4">
                      {parentCategory ? (
                        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          {parentCategory.name}
                        </span>
                      ) : (
                        <span className="bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          Root
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    {/* <TableCell className="p-4 space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground cursor-pointer font-medium"
                        onClick={() => {
                          const originalCategory = categories.find(
                            (c) => c.id === cat.id,
                          );
                          setEditingCategory(originalCategory);
                          setIsEditOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80 cursor-pointer font-medium"
                        onClick={async () => {
                          const confirmed = window.confirm(
                            `Are you sure to delete "${originalCategory?.name}" ...`,
                          );

                          if (!confirmed) return;

                          try {
                            const result = await deleteCategory(
                              cat.id.toString(),
                            );
                            if (result.success) {
                              console.log(result.message);
                            } else {
                              alert(result.message || "Failed to delete");
                            }
                          } catch (error) {
                            console.error("Delete error:", error);
                            alert("Something went wrong!");
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell> */}
                    <TableCell className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-40">
                          {/* Manage Fields Action */}
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/categories/${cat.id}/fields`}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                              <span>Fields</span>
                            </Link>
                          </DropdownMenuItem>

                          {/* Edit Action */}
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              const originalCategory = categories.find(
                                (c) => c.id === cat.id,
                              );
                              setEditingCategory(originalCategory);
                              setIsEditOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                            <span>Edit</span>
                          </DropdownMenuItem>

                          {/* Delete Action */}
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                            onClick={async () => {
                              const confirmed = window.confirm(
                                `Are you sure to delete "${originalCategory?.name}"?`,
                              );

                              if (!confirmed) return;

                              try {
                                const result = await deleteCategory(
                                  cat.id.toString(),
                                );
                                if (result.success) {
                                  console.log(result.message);
                                } else {
                                  alert(result.message || "Failed to delete");
                                }
                              } catch (error) {
                                console.error("Delete error:", error);
                                alert("Something went wrong!");
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CategoryTable;
