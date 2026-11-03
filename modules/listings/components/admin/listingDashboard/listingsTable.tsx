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
  XCircle,
  Clock,
  Star,
  ImageIcon,
  MapPin,
  ExternalLink,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  updateListingStatusAction,
  toggleListingFeaturedAction,
  type ListingStatusType,
} from "@/modules/listings/actions/updateListingStatusAction";
import { ListingsTableProps } from "@/modules/listings/types";

// Common rejection presets for fast selection
const REJECTION_PRESETS = [
  "Location is outside Bahawalpur boundary",
  "Invalid or unreachable phone number",
  "Incorrect or misleading business information",
  "Inappropriate images or details",
];

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

  // 2. Quick Status State
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isUpdatingStatus, startStatusTransition] = useTransition();

  // 3. Rejection Modal State
  const [rejectingListing, setRejectingListing] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Delete confirm action handler
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

  // Quick Status change handler (Approve, Pending, Reject)
  const handleStatusChange = (
    listingId: number,
    status: ListingStatusType,
    reason?: string,
  ) => {
    setUpdatingId(listingId);
    startStatusTransition(async () => {
      try {
        const res = await updateListingStatusAction({
          listingId,
          status,
          rejectionReason: reason,
        });

        if (res.success) {
          toast.success(res.message);
          if (status === "rejected") {
            setRejectingListing(null);
            setRejectionReason("");
          }
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("Status update karte waqt error aaya.");
      } finally {
        setUpdatingId(null);
      }
    });
  };

  // Toggle Featured status handler
  const handleToggleFeatured = (
    listingId: number,
    currentFeatured: boolean,
  ) => {
    setUpdatingId(listingId);
    startStatusTransition(async () => {
      try {
        const res = await toggleListingFeaturedAction(
          listingId,
          currentFeatured,
        );
        if (res.success) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("Featured status update karte waqt error aaya.");
      } finally {
        setUpdatingId(null);
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

                  {/* 3. Listing Name + Location & Quick Map Verification */}
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground leading-tight">
                          {item.title}
                        </span>

                        {/* Featured Badge */}
                        {item.isFeatured && (
                          <span title="Featured Listing">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500 shrink-0" />
                          </span>
                        )}
                      </div>

                      {/* Location Details & Maps Link */}
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        {item.area?.name && (
                          <span className="font-medium text-foreground/80">
                            {item.area.name}
                          </span>
                        )}

                        {item.address && (
                          <>
                            {item.area?.name && <span>•</span>}
                            <span
                              className="line-clamp-1 max-w-[200px]"
                              title={item.address}
                            >
                              {item.address}
                            </span>
                          </>
                        )}

                        <span>•</span>

                        {item.mapsUrl ? (
                          <a
                            href={item.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 hover:underline cursor-pointer"
                            title="Verify location on Google Maps in new tab"
                          >
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>Maps</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-muted-foreground/50 italic"
                            title="No Google Maps link provided"
                          >
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>No Map</span>
                          </span>
                        )}
                      </div>
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
                    <div className="flex flex-col gap-1 items-start">
                      <Badge
                        variant={getStatusBadgeVariant(item.status)}
                        className={`capitalize font-medium ${
                          item.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                            : item.status === "pending"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                            : item.status === "rejected"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                            : ""
                        }`}
                      >
                        {item.status}
                      </Badge>
                      {item.status === "rejected" && item.adminNotes && (
                        <span
                          className="text-[11px] text-rose-600 dark:text-rose-400 line-clamp-1 max-w-[150px]"
                          title={`Rejection Reason: ${item.adminNotes}`}
                        >
                          {item.adminNotes}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* 6. Created At */}
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
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
                          disabled={isUpdatingStatus && updatingId === item.id}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
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

                        {/* Direct Maps Verification */}
                        {item.mapsUrl && (
                          <DropdownMenuItem
                            asChild
                            className="cursor-pointer gap-2"
                          >
                            <a
                              href={item.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MapPin className="h-4 w-4 text-primary" />
                              <span>Open on Maps</span>
                              <ExternalLink className="h-3 w-3 ml-auto opacity-70" />
                            </a>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                          Quick Status
                        </DropdownMenuLabel>

                        {/* Quick Approve */}
                        {item.status !== "approved" && (
                          <DropdownMenuItem
                            disabled={isUpdatingStatus && updatingId === item.id}
                            className="cursor-pointer gap-2 text-emerald-600 dark:text-emerald-400 focus:text-emerald-700 dark:focus:text-emerald-300"
                            onClick={() => handleStatusChange(item.id, "approved")}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Approve</span>
                          </DropdownMenuItem>
                        )}

                        {/* Quick Reject */}
                        {item.status !== "rejected" && (
                          <DropdownMenuItem
                            disabled={isUpdatingStatus && updatingId === item.id}
                            className="cursor-pointer gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-700 dark:focus:text-rose-300"
                            onClick={() => {
                              setRejectingListing({
                                id: item.id,
                                title: item.title,
                              });
                              setRejectionReason(item.adminNotes || "");
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject...</span>
                          </DropdownMenuItem>
                        )}

                        {/* Quick Mark Pending */}
                        {item.status !== "pending" && (
                          <DropdownMenuItem
                            disabled={isUpdatingStatus && updatingId === item.id}
                            className="cursor-pointer gap-2 text-amber-600 dark:text-amber-400 focus:text-amber-700 dark:focus:text-amber-300"
                            onClick={() => handleStatusChange(item.id, "pending")}
                          >
                            <Clock className="h-4 w-4" />
                            <span>Mark as Pending</span>
                          </DropdownMenuItem>
                        )}

                        {/* Toggle Featured */}
                        <DropdownMenuItem
                          disabled={isUpdatingStatus && updatingId === item.id}
                          className="cursor-pointer gap-2"
                          onClick={() =>
                            handleToggleFeatured(
                              item.id,
                              Boolean(item.isFeatured),
                            )
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              item.isFeatured
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span>
                            {item.isFeatured
                              ? "Unmark Featured"
                              : "Mark as Featured"}
                          </span>
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

      {/* 4. Quick Rejection Dialog with Presets */}
      <Dialog
        open={Boolean(rejectingListing)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingListing(null);
            setRejectionReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span>Reject Listing</span>
            </DialogTitle>
            <DialogDescription>
              Aap &ldquo;{rejectingListing?.title}&rdquo; ko reject karne lage hain.
              Rejection reason provide karein taake record safe rahe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Quick preset chips */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Quick Reason Presets:
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {REJECTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors cursor-pointer ${
                      rejectionReason === preset
                        ? "border-destructive bg-destructive/10 text-destructive font-medium"
                        : "border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom note textarea */}
            <div className="space-y-1.5">
              <Label htmlFor="rejectionNote" className="text-sm font-medium">
                Reason / Admin Note
              </Label>
              <Textarea
                id="rejectionNote"
                rows={3}
                placeholder="e.g. Location is outside Bahawalpur boundary, shop does not exist..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isUpdatingStatus}
              onClick={() => {
                setRejectingListing(null);
                setRejectionReason("");
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isUpdatingStatus || !rejectingListing}
              onClick={() => {
                if (rejectingListing) {
                  handleStatusChange(
                    rejectingListing.id,
                    "rejected",
                    rejectionReason.trim() ||
                      "Location or listing details rejected by admin",
                  );
                }
              }}
              className="cursor-pointer gap-1.5"
            >
              <XCircle className="h-4 w-4" />
              <span>
                {isUpdatingStatus ? "Rejecting..." : "Confirm Rejection"}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListingsTable;
