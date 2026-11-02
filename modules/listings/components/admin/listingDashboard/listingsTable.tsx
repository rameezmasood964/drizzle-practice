"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Star,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { deleteListingAction } from "@/modules/listings/actions/deletelistingaction";
import { ListingsTableProps } from "@/modules/listings/types";

// Status ke semantic variants ke liye mapping
const getStatusBadgeVariant = (
  status: string,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "approved":
      return "default";
    case "pending":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
};

const ListingsTable = ({ listings = [], pagination }: ListingsTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalCount = pagination?.totalCount || 0;

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  // 1. Delete dialog state aur pending state
  const [listingToDelete, setListingToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  // 2. Delete confirm action handler
  const handleDeleteConfirm = () => {
    if (!listingToDelete) return;

    startDeleteTransition(async () => {
      try {
        const res = await deleteListingAction(listingToDelete.id);
        if (res.success) {
          toast.success(res.message);
          setListingToDelete(null); // Dialog close karein
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("Listing delete karte waqt server error aaya.");
      }
    });
  };

  return (
    <>
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {/* 1. Checkbox */}
              <TableHead className="w-[48px] px-4">
                <Checkbox aria-label="Select all" />
              </TableHead>

              {/* 2. Thumbnail */}
              <TableHead className="w-[80px]">Image</TableHead>

              {/* 3. Title */}
              <TableHead className="min-w-[200px]">Listing Name</TableHead>

              {/* 4. Category */}
              <TableHead>Category</TableHead>

              {/* 5. Status */}
              <TableHead>Status</TableHead>

              {/* 6. Created Date */}
              <TableHead>Created At</TableHead>

              {/* 7. Actions */}
              <TableHead className="w-[70px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No listings found.
                </TableCell>
              </TableRow>
            ) : (
              listings.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  {/* 1. Row Checkbox */}
                  <TableCell className="px-4">
                    <Checkbox aria-label={`Select ${item.title}`} />
                  </TableCell>

                  {/* 2. Image / Thumbnail */}
                  <TableCell>
                    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                      {/* @ts-ignore primaryImage check */}
                      {item.primaryImage ? (
                        <Image
                          // @ts-ignore
                          src={item.primaryImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>

                  {/* 3. Listing Name + Badges */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">
                          {item.title}
                        </span>

                        {/* Featured Badge */}
                        {item.isFeatured && (
                          <span title="Featured Listing">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          </span>
                        )}
                      </div>

                      {/* Area Name display */}
                      {item.area?.name && (
                        <span className="text-xs text-muted-foreground">
                          {item.area.name}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* 4. Category Badge (Parent > SubCategory safe check) */}
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {item.parentCategory?.name
                        ? `${item.parentCategory.name} > ${item.category?.name}`
                        : item.category?.name || "Uncategorized"}
                    </Badge>
                  </TableCell>

                  {/* 5. Status Badge */}
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(item.status)}
                      className="capitalize"
                    >
                      {item.status}
                    </Badge>
                  </TableCell>

                  {/* 6. Created At */}
                  <TableCell className="text-sm text-muted-foreground">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </TableCell>

                  {/* 7. Actions Dropdown */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* View Option */}
                        <DropdownMenuItem
                          asChild
                          className="cursor-pointer gap-2"
                        >
                          <Link href={`/listings/${item.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                            <span>View Public</span>
                          </Link>
                        </DropdownMenuItem>

                        {/* Edit Option */}
                        <DropdownMenuItem
                          asChild
                          className="cursor-pointer gap-2"
                        >
                          <Link href={`/admin/listings/${item.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Delete Option */}
                        <DropdownMenuItem
                          onSelect={() =>
                            setListingToDelete({
                              id: item.id,
                              title: item.title,
                            })
                          }
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls Bar */}
        {totalCount > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border px-4 py-3 sm:flex-row">
            <div className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {(currentPage - 1) * 10 + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(currentPage * 10, totalCount)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{totalCount}</span>{" "}
              listings
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(1)}
                disabled={currentPage <= 1}
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">First page</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2.5 text-xs"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <span className="px-2 text-xs font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2.5 text-xs"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage >= totalPages}
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Last page</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Reusable ConfirmDialog Component */}
      <ConfirmDialog
        open={Boolean(listingToDelete)}
        onOpenChange={(open) => {
          if (!open) setListingToDelete(null);
        }}
        title="Permanent Delete Listing"
        description={`Kya aap waqayi "${listingToDelete?.title || "is listing"}" ko permanently delete karna chahte hain? Yeh hard delete hai aur iska data recover nahi ho sakega.`}
        confirmText="Delete Permanently"
        cancelText="Cancel"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default ListingsTable;
