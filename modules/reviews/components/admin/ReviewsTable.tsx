"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  CornerDownRight,
  Star,
  MessageSquareOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import ReviewStatusBadge from "./ReviewStatusBadge";
import type { ReviewItem, ReviewsTableProps } from "../../types";

export const ReviewsTable: React.FC<ReviewsTableProps> = ({
  reviews,
  selectedIds = [],
  onSelectAll,
  onSelectRow,
  currentPage = 1,
  pageSize = 10,
  totalItems = reviews.length,
  onPageChange,
  onPageSizeChange,
  onApprove,
  onRejectClick,
  onReplyClick,
  onViewDetail,
  onDelete,
}) => {
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const isAllSelected =
    reviews.length > 0 && reviews.every((r) => selectedIds.includes(r.id));
  const isSomeSelected =
    reviews.some((r) => selectedIds.includes(r.id)) && !isAllSelected;

  if (totalItems === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <MessageSquareOff className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">
          No reviews found
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          No customer reviews match your active filter criteria. Try adjusting the
          status, rating, or search query.
        </p>
      </div>
    );
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {/* Checkbox Column */}
              {onSelectAll && (
                <TableHead className="w-[44px] px-3">
                  <Checkbox
                    checked={
                      isAllSelected
                        ? true
                        : isSomeSelected
                        ? "indeterminate"
                        : false
                    }
                    onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
                    aria-label="Select all reviews on current page"
                  />
                </TableHead>
              )}
              <TableHead className="min-w-[180px]">Listing</TableHead>
              <TableHead className="min-w-[140px]">Reviewer</TableHead>
              <TableHead className="w-[110px]">Rating</TableHead>
              <TableHead className="min-w-[260px]">Excerpt</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[110px]">Date</TableHead>
              <TableHead className="w-[70px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {reviews.map((review) => {
              const isSelected = selectedIds.includes(review.id);
              const formattedDate = review.createdAt
                ? new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "-";

              return (
                <TableRow
                  key={review.id}
                  className={`transition-colors ${
                    isSelected
                      ? "bg-primary/5 hover:bg-primary/10 dark:bg-primary/10"
                      : "hover:bg-muted/40"
                  }`}
                >
                  {/* Row Checkbox */}
                  {onSelectRow && (
                    <TableCell className="w-[44px] px-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          onSelectRow(review.id, Boolean(checked))
                        }
                        aria-label={`Select review ${review.id}`}
                      />
                    </TableCell>
                  )}

                  {/* 1. Listing */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <p
                        className="font-semibold text-foreground text-xs line-clamp-1 hover:underline cursor-pointer"
                        onClick={() => onViewDetail(review)}
                        title={review.listingTitle}
                      >
                        {review.listingTitle}
                      </p>
                      {review.listingCategory && (
                        <span className="text-[10px] text-muted-foreground block line-clamp-1">
                          {review.listingCategory}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* 2. Reviewer */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground text-xs">
                        {review.userName}
                      </p>
                      {review.userEmail && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                          {review.userEmail}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* 3. Rating */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-foreground ml-0.5">
                        {review.rating}
                      </span>
                    </div>
                  </TableCell>

                  {/* 4. Excerpt & Owner Reply Tag */}
                  <TableCell>
                    <div className="space-y-1">
                      {review.title && (
                        <span className="font-semibold text-foreground text-xs block truncate max-w-[320px]">
                          {review.title}
                        </span>
                      )}
                      <p
                        className="text-xs text-muted-foreground line-clamp-2 max-w-[360px] leading-relaxed cursor-pointer hover:text-foreground"
                        onClick={() => onViewDetail(review)}
                        title={review.comment}
                      >
                        {review.comment}
                      </p>
                      {review.ownerReply && (
                        <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
                          <CornerDownRight className="h-3 w-3" />
                          <span>Owner Replied</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* 5. Status Badge */}
                  <TableCell>
                    <ReviewStatusBadge status={review.status} />
                  </TableCell>

                  {/* 6. Date */}
                  <TableCell>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formattedDate}
                    </span>
                  </TableCell>

                  {/* 7. Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel className="text-xs">
                          Review Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => onViewDetail(review)}
                          className="text-xs cursor-pointer"
                        >
                          <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          <span>View Detail</span>
                        </DropdownMenuItem>

                        {review.status !== "approved" && (
                          <DropdownMenuItem
                            onClick={() => onApprove(review.id)}
                            className="text-xs cursor-pointer text-emerald-600 dark:text-emerald-400 focus:text-emerald-600"
                          >
                            <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                            <span>Approve Review</span>
                          </DropdownMenuItem>
                        )}

                        {review.status !== "rejected" && (
                          <DropdownMenuItem
                            onClick={() => onRejectClick(review)}
                            className="text-xs cursor-pointer text-rose-600 dark:text-rose-400 focus:text-rose-600"
                          >
                            <XCircle className="mr-2 h-3.5 w-3.5" />
                            <span>Reject Review...</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => onReplyClick(review)}
                          className="text-xs cursor-pointer"
                        >
                          <CornerDownRight className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {review.ownerReply ? "Edit Reply..." : "Reply as Owner..."}
                          </span>
                        </DropdownMenuItem>

                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setReviewToDelete(review)}
                              className="text-xs cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              <span>Delete Review</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {onPageChange && onPageSizeChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1">
          {/* Results count text */}
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startIndex}</span> to{" "}
            <span className="font-medium text-foreground">{endIndex}</span> of{" "}
            <span className="font-medium text-foreground">{totalItems}</span> reviews
          </p>

          {/* Right: Items per page + Navigation Buttons */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => onPageSizeChange(Number(val))}
              >
                <SelectTrigger className="h-8 w-[72px] text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10" className="text-xs">10</SelectItem>
                  <SelectItem value="25" className="text-xs">25</SelectItem>
                  <SelectItem value="50" className="text-xs">50</SelectItem>
                  <SelectItem value="100" className="text-xs">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => onPageChange(1)}
                disabled={currentPage <= 1}
                title="First Page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                title="Previous Page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              {/* Page number buttons */}
              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers().map((p, idx) =>
                  typeof p === "number" ? (
                    <Button
                      key={idx}
                      variant={p === currentPage ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 text-xs"
                      onClick={() => onPageChange(p)}
                    >
                      {p}
                    </Button>
                  ) : (
                    <span
                      key={idx}
                      className="px-1 text-xs text-muted-foreground select-none"
                    >
                      {p}
                    </span>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                title="Next Page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage >= totalPages}
                title="Last Page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <AlertDialog
          open={Boolean(reviewToDelete)}
          onOpenChange={(open) => !open && setReviewToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-semibold">
                Delete Review?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                Are you sure you want to delete this review from &quot;
                {reviewToDelete?.userName}&quot; on {reviewToDelete?.listingTitle}?
                This action will recalculate the listing&apos;s rating and cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (reviewToDelete) {
                    onDelete(reviewToDelete.id);
                    setReviewToDelete(null);
                  }
                }}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-medium"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default ReviewsTable;
