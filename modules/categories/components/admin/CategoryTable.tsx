"use client";

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
        
        {/* 1. Add Category Dialog */}
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

      {/* 2. Edit Category Dialog Modal */}
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

      {/* Shadcn Table start */}
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
              formattedCategories.map((cat) => {
                const originalCategory = categories.find(
                  (c) => c.id === cat.id,
                );

                const parentCategory = categories.find(
                  (c) => c.id === originalCategory?.parentId,
                );

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
                    <TableCell className="p-4 space-x-3">
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
                        disabled
                      >
                        Delete
                      </Button>
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