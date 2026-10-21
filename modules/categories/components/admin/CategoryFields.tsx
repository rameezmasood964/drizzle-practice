"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CategoryFieldsProps } from "../../types";
import AddCategoryFieldForm from "./AddCategoryFieldForm";
import { deleteField } from "../../actions/fields";

export default function CategoryFields({
  categoryName,
  categoryId,
  initialFields = [],
}: CategoryFieldsProps) {
  // all states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  // 1. Kis field par click hua hai, uska data rakhne ke liye state
  const [fieldToDelete, setFieldToDelete] = useState<{
    id: number;
    label: string;
  } | null>(null);

  // Edit drawer ke liye state
  const [fieldToEdit, setFieldToEdit] = useState<any | null>(null);

  const fields = initialFields;

  // 2. Trash button click hone par dialog kholne ka chhota function
  const openDeleteModal = (id: number, label: string) => {
    setFieldToDelete({ id, label });
  };

  const handleConfirmDelete = async () => {
    // Confirm popup
    if (!fieldToDelete) return;

    const targetId = fieldToDelete.id;
    setDeletingId(targetId);
    try {
      const response = await deleteField(targetId, Number(categoryId));
      if (response.success) {
        toast.success(response.message || "Field delete ho gayi");
      } else {
        toast.error(response.error || "Delete fail ho gaya");
      }
    } catch (error) {
      toast.error("Kuch ghalat ho gaya");
    } finally {
      setDeletingId(null);
      setFieldToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/categories">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                Custom Fields
              </h1>
              <Badge variant="secondary" className="font-semibold text-xs">
                {categoryName || "Category"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage dynamic specifications and filters for listings in this
              category.
            </p>
          </div>
        </div>

        {/* Add Field Sheet Trigger (Side Drawer) */}
        <Sheet
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) setFieldToEdit(null);
          }}
        >
          <SheetTrigger asChild>
            <Button
              className="cursor-pointer gap-2"
              onClick={() => setFieldToEdit(null)}
            >
              <Plus className="h-4 w-4" />
              Add Field
            </Button>
          </SheetTrigger>

          <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 h-full">
            <SheetHeader className="p-6 pb-4 border-b text-left">
              <SheetTitle>
                {fieldToEdit ? "Edit Custom Field" : "Add Custom Field"}
              </SheetTitle>
              <SheetDescription>
                {fieldToEdit
                  ? `Update settings for "${fieldToEdit.label}".`
                  : `Create a dynamic field for "${categoryName || "Category"}".`}
              </SheetDescription>
            </SheetHeader>

            {/* Form Component */}
            <AddCategoryFieldForm
              key={fieldToEdit ? fieldToEdit.id : "new"}
              categoryId={categoryId}
              initialData={fieldToEdit}
              onSuccess={() => {
                setIsAddOpen(false);
                setFieldToEdit(null);
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* 2. Fields Table */}
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="p-4 font-medium">Label</TableHead>
                <TableHead className="p-4 font-medium">Key</TableHead>
                <TableHead className="p-4 font-medium">Type</TableHead>
                <TableHead className="p-4 font-medium">Required</TableHead>
                <TableHead className="p-4 font-medium">Filterable</TableHead>
                <TableHead className="p-4 font-medium text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-border">
              {fields.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    <SlidersHorizontal className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No custom fields added yet. Click &quot;Add Field&quot; to
                    configure.
                  </TableCell>
                </TableRow>
              ) : (
                fields.map((f) => {
                  const isInherited = f.categoryId !== Number(categoryId);

                  return (
                    <TableRow
                      key={f.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="p-4 font-medium text-foreground">
                        {f.label}
                      </TableCell>

                      <TableCell className="p-4">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
                          {f.key}
                        </code>
                      </TableCell>

                      <TableCell className="p-4">
                        <Badge variant="outline" className="capitalize text-xs">
                          {f.type}
                        </Badge>
                      </TableCell>

                      <TableCell className="p-4">
                        {f.isRequired ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <XCircle className="h-3.5 w-3.5 opacity-50" />
                            No
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="p-4">
                        {f.isFilterable ? (
                          <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <XCircle className="h-3.5 w-3.5 opacity-50" />
                            No
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="p-4 text-right">
                        {isInherited ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] text-muted-foreground"
                          >
                            Inherited
                          </Badge>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            {/* 1. Edit Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setFieldToEdit(f);
                                setIsAddOpen(true); // 👈 Same Sheet khol dega!
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            {/* 2. Trash Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={deletingId === f.id}
                              onClick={() => openDeleteModal(f.id, f.label)}
                              className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        open={!!fieldToDelete}
        onOpenChange={(open) => !open && setFieldToDelete(null)}
        description={`Kya aap waqai "${fieldToDelete?.label}" field ko delete karna chahte hain? Yeh field listings ke form se hata di jayegi.`}
        isLoading={deletingId !== null}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
