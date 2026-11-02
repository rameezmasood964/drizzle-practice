"use client";

import Link from "next/link";
import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  MoreHorizontal,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
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
import {
  toggleCategoryStatusAction,
  deleteCategoryAction,
} from "../../actions/categories";

const CategoryTable = ({
  categories,
  allCategories,
  pagination,
  searchQuery = "",
}: CategoryTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Search State & Debounce (~300ms)
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const currentParam = searchParams.get("search") || "";
      if (searchTerm.trim() === currentParam) return;

      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Full category list fallback
  const fullCategoryList = allCategories || categories;

  // Delete State
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  // Status Toggle State
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [isToggling, startToggleTransition] = useTransition();

  // Categories ko hierarchy order mein convert karein
  const formattedCategories = formatCategoryTree(categories);

  // Status Toggle Handler
  const handleToggle = (id: number, currentStatus: boolean) => {
    setTogglingId(id);
    startToggleTransition(async () => {
      try {
        const res = await toggleCategoryStatusAction(id, !currentStatus);
        if (res.success) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("Failed to update category status.");
      } finally {
        setTogglingId(null);
      }
    });
  };

  // Safe Delete Handler
  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return;
    startDeleteTransition(async () => {
      try {
        const res = await deleteCategoryAction(categoryToDelete.id);
        if (res.success) {
          toast.success(res.message);
          setCategoryToDelete(null);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("Failed to delete category.");
      }
    });
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
      {/* Heading, Search and Add Dialog */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Categories</h2>
          <p className="text-sm text-muted-foreground">
            {pagination
              ? `Total ${pagination.totalCount} ${searchQuery ? "matching categories" : "root categories"} (${fullCategoryList.length} total categories).`
              : "Manage your parent categories, subcategories, and their custom fields."}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search category name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 h-9"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer gap-1.5 shrink-0">
                <span>Add Category</span>
                <span>+</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>

              <CategoryForm
                onSuccess={() => setOpen(false)}
                categories={fullCategoryList}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Category Dialog */}
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
              categories={fullCategoryList}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="p-4 font-medium w-16">Icon</TableHead>
              <TableHead className="p-4 font-medium">Name</TableHead>
              <TableHead className="p-4 font-medium">Slug</TableHead>
              <TableHead className="p-4 font-medium">Parent Category</TableHead>
              <TableHead className="p-4 font-medium">Status & Toggle</TableHead>
              <TableHead className="p-4 font-medium text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border">
            {formattedCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center p-6 text-muted-foreground"
                >
                  {searchQuery
                    ? `No categories found matching "${searchQuery}".`
                    : "No categories found. Add your first category!"}
                </TableCell>
              </TableRow>
            ) : (
              formattedCategories.map((cat) => {
                const originalCategory = fullCategoryList.find(
                  (c) => c.id === cat.id,
                );

                const parentCategory = fullCategoryList.find(
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
                    <TableCell className="p-4 text-muted-foreground font-mono text-xs">
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

                    {/* Status & Toggle Switch Column */}
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={Boolean(originalCategory?.isActive)}
                          disabled={isToggling && togglingId === cat.id}
                          onCheckedChange={() =>
                            handleToggle(
                              cat.id,
                              Boolean(originalCategory?.isActive),
                            )
                          }
                        />
                        {originalCategory?.isActive ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 font-normal text-emerald-600 dark:text-emerald-400"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="font-normal text-muted-foreground"
                          >
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions Dropdown */}
                    <TableCell className="p-4 text-right">
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
                              if (originalCategory) {
                                setEditingCategory(originalCategory);
                                setIsEditOpen(true);
                              }
                            }}
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                            <span>Edit</span>
                          </DropdownMenuItem>

                          {/* Delete Action with Safe Confirm Modal */}
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                              if (originalCategory) {
                                setCategoryToDelete({
                                  id: originalCategory.id,
                                  name: originalCategory.name,
                                });
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

      {/* Pagination Footer */}
      {pagination && pagination.totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-sm text-muted-foreground">
          <div>
            Showing{" "}
            <span className="font-medium text-foreground">
              {pagination.totalCount === 0
                ? 0
                : (pagination.currentPage - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalCount,
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {pagination.totalCount}
            </span>{" "}
            {searchQuery ? "matching categories" : "root categories"}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={pagination.currentPage <= 1}
              className="h-8 px-2 cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="h-8 px-2.5 gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="px-3 py-1 text-xs font-medium rounded-md bg-muted text-foreground">
              Page {pagination.currentPage} of {pagination.totalPages || 1}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="h-8 px-2.5 gap-1 cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="h-8 px-2 cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reusable ConfirmDialog for Safe Category Deletion */}
      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
        title="Delete Category"
        description={`Are you sure you want to permanently delete "${categoryToDelete?.name}"? If any subcategories or listings are currently linked to this category, deletion will be safely blocked.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default CategoryTable;
