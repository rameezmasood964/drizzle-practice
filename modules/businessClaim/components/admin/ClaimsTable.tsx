"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  ShieldCheck,
  XCircle,
  Trash2,
  FileText,
  ExternalLink,
  Phone,
  Mail,
  User,
  Inbox,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import ClaimStatusBadge from "./ClaimStatusBadge";
import type { ClaimItem, ClaimsTableProps } from "../../types";

export const ClaimsTable: React.FC<ClaimsTableProps> = ({
  claims,
  selectedIds,
  onSelectAll,
  onSelectRow,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onApproveClick,
  onRejectClick,
  onDeleteClick,
}) => {
  const [claimToDelete, setClaimToDelete] = useState<ClaimItem | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const isAllSelected =
    claims.length > 0 && claims.every((c) => selectedIds.includes(c.id));
  const isSomeSelected =
    claims.some((c) => selectedIds.includes(c.id)) && !isAllSelected;

  if (totalItems === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">
          No claims found
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          No business ownership claims match your active filter criteria. Try
          adjusting the status, category, or search query.
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
              <TableHead className="w-[44px] px-3">
                <Checkbox
                  checked={
                    isAllSelected ? true : isSomeSelected ? "indeterminate" : false
                  }
                  onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
                  aria-label="Select all claims on current page"
                />
              </TableHead>
              <TableHead className="min-w-[200px]">Listing</TableHead>
              <TableHead className="min-w-[160px]">Claimant</TableHead>
              <TableHead className="min-w-[150px]">Phone & Role</TableHead>
              <TableHead className="w-[140px]">Verification Proof</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[120px]">Submitted Date</TableHead>
              <TableHead className="w-[70px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {claims.map((claim) => {
              const isSelected = selectedIds.includes(claim.id);
              const formattedDate = claim.createdAt
                ? new Date(claim.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "-";

              return (
                <TableRow
                  key={claim.id}
                  className={`transition-colors ${
                    isSelected
                      ? "bg-primary/5 hover:bg-primary/10 dark:bg-primary/10"
                      : "hover:bg-muted/40"
                  }`}
                >
                  {/* Row Checkbox */}
                  <TableCell className="w-[44px] px-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        onSelectRow(claim.id, Boolean(checked))
                      }
                      aria-label={`Select claim ${claim.id}`}
                    />
                  </TableCell>

                  {/* 1. Listing */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-semibold text-foreground text-xs line-clamp-1 hover:underline cursor-pointer"
                          onClick={() => onViewDetail(claim)}
                          title={claim.listingTitle}
                        >
                          {claim.listingTitle}
                        </span>
                        {claim.listingSlug && (
                          <Link
                            href={`/listings/${claim.listingSlug}`}
                            target="_blank"
                            className="text-muted-foreground hover:text-primary shrink-0"
                            title="View Public Listing"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                      {claim.categoryName && (
                        <span className="text-[10px] text-muted-foreground block line-clamp-1">
                          {claim.categoryName}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* 2. Claimant */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground text-xs flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{claim.claimantName}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[160px] flex items-center gap-1">
                        <Mail className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                        <span>{claim.claimantEmail}</span>
                      </p>
                    </div>
                  </TableCell>

                  {/* 3. Phone & Role */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{claim.claimantPhone}</span>
                      </p>
                      <span className="inline-block text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                        {claim.claimantRole}
                      </span>
                    </div>
                  </TableCell>

                  {/* 4. Verification Proof */}
                  <TableCell>
                    {claim.proofDocumentUrl ? (
                      <button
                        type="button"
                        onClick={() => onViewDetail(claim)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors"
                      >
                        <ImageIcon className="h-3 w-3 shrink-0" />
                        <span>View Proof</span>
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                        <FileText className="h-3 w-3 text-muted-foreground/60" />
                        <span>No file</span>
                      </span>
                    )}
                  </TableCell>

                  {/* 5. Status Badge */}
                  <TableCell>
                    <ClaimStatusBadge status={claim.status} />
                  </TableCell>

                  {/* 6. Submitted Date */}
                  <TableCell>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formattedDate}
                    </span>
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
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs">
                          Claim Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => onViewDetail(claim)}
                          className="text-xs cursor-pointer"
                        >
                          <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          <span>View Details</span>
                        </DropdownMenuItem>

                        {claim.status !== "approved" && (
                          <DropdownMenuItem
                            onClick={() => onApproveClick(claim)}
                            className="text-xs cursor-pointer text-emerald-600 dark:text-emerald-400 focus:text-emerald-600"
                          >
                            <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                            <span>Approve Claim...</span>
                          </DropdownMenuItem>
                        )}

                        {claim.status !== "rejected" && (
                          <DropdownMenuItem
                            onClick={() => onRejectClick(claim)}
                            className="text-xs cursor-pointer text-rose-600 dark:text-rose-400 focus:text-rose-600"
                          >
                            <XCircle className="mr-2 h-3.5 w-3.5" />
                            <span>Reject Claim...</span>
                          </DropdownMenuItem>
                        )}

                        {onDeleteClick && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setClaimToDelete(claim)}
                              className="text-xs cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              <span>Delete Claim</span>
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1">
        {/* Results count text */}
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{startIndex}</span> to{" "}
          <span className="font-medium text-foreground">{endIndex}</span> of{" "}
          <span className="font-medium text-foreground">{totalItems}</span> claims
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

      {/* Delete Confirmation Dialog */}
      {onDeleteClick && (
        <AlertDialog
          open={Boolean(claimToDelete)}
          onOpenChange={(open) => !open && setClaimToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-semibold">
                Delete Claim Request?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                Are you sure you want to delete the ownership claim for &quot;
                {claimToDelete?.listingTitle}&quot; submitted by{" "}
                {claimToDelete?.claimantName}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (claimToDelete) {
                    onDeleteClick(claimToDelete);
                    setClaimToDelete(null);
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

export default ClaimsTable;
