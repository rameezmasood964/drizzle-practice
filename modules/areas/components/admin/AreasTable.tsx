"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  MapPin,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { AreasTableProps, Area } from "../../types";
import { toggleAreaStatus, deleteArea } from "../../actions/areas";
import AddAreasForm from "./AddAreasForm";

export default function AreasTable({
  areas = [],
  isLoading = false,
  pagination,
  searchQuery = "",
}: AreasTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const isFirstRender = useRef(true);

  // Sync state if searchQuery prop changes externally
  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  // Debounce search update (~300ms)
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

  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Common Dialog States for Add & Edit
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  const handleAddNew = () => {
    setSelectedArea(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (area: Area) => {
    setSelectedArea(area);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedArea(null);
  };

  // Status Toggle Handler
  const handleToggle = (id: number, currentStatus: boolean) => {
    setLoadingId(id);
    startTransition(async () => {
      const result = await toggleAreaStatus(id, currentStatus);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setLoadingId(null);
    });
  };

  // Permanent Delete Handler
  const handleDelete = () => {
    if (!deletingId) return;

    setLoadingId(deletingId);
    startTransition(async () => {
      const result = await deleteArea(deletingId);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setDeletingId(null);
      setLoadingId(null);
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        Loading areas...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header Bar with Search & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Registered Areas
          </h2>
          <p className="text-sm text-muted-foreground">
            {pagination
              ? `Total ${pagination.totalCount} areas database mein mojood hain.`
              : `Total ${areas.length} areas database mein mojood hain.`}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search area name..."
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
          <Button onClick={handleAddNew} className="gap-2 shrink-0 cursor-pointer">
            <Plus className="h-4 w-4" />
            Add Area
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border bg-card shadow-sm">
        {areas.length === 0 ? (
          <div className="border-dashed p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold">No areas found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Bahawalpur ka koi area abhi tak add nahi kiya gaya.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status & Toggle</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area) => (
                <TableRow key={area.id}>
                  {/* Area Name */}
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span>{area.name}</span>
                    </div>
                  </TableCell>

                  {/* Slug */}
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {area.slug}
                  </TableCell>

                  {/* Status with Toggle Switch */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={area.isActive}
                        disabled={isPending && loadingId === area.id}
                        onCheckedChange={() =>
                          handleToggle(area.id, area.isActive)
                        }
                      />
                      {area.isActive ? (
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleEdit(area)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Area
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => setDeletingId(area.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-sm text-muted-foreground">
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
            areas
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

      {/* 🌟 Add / Edit Shared Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedArea(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedArea ? "Edit Area" : "Add New Area"}
            </DialogTitle>
            <DialogDescription>
              {selectedArea
                ? "Area ka name ya slug update karein."
                : "Bahawalpur ka naya town ya mohalla create karein."}
            </DialogDescription>
          </DialogHeader>

          <AddAreasForm
            key={selectedArea ? `edit-${selectedArea.id}` : "create"}
            initialData={selectedArea}
            onSuccess={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      {/* 🌟 Reusable Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Are you sure you want to delete this area?"
        description="Yeh area database se permanently delete ho jayega. Agar iske sath listings connected hui toh system allow nahi karega."
        confirmText="Delete Area"
        isLoading={isPending && loadingId === deletingId}
        onConfirm={handleDelete}
      />
    </div>
  );
}
