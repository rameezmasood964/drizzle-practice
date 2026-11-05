"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  X,
  AlertCircle,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import ReviewsStatsCards from "../admin/ReviewsStatsCards";
import ReviewsFilterBar, { DEFAULT_CATEGORIES } from "../admin/ReviewsFilterBar";
import ReviewsTable from "../admin/ReviewsTable";
import ReviewDetailModal from "../admin/ReviewDetailModal";
import RejectReasonModal from "../admin/RejectReasonModal";
import OwnerReplyModal from "../admin/OwnerReplyModal";
import {
  approveReviewAction,
  rejectReviewAction,
  updateOwnerReplyAction,
  deleteReviewAction,
} from "../../actions/reviewActions";
import type {
  ReviewItem,
  ReviewStats,
  ReviewFilters,
  ReviewViewWrapperProps,
} from "../../types";

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: 1,
    listingId: 101,
    listingTitle: "Al-Rehman Boys Hostel Near IUB",
    listingCategory: "Hostels > Boys Hostels",
    parentCategoryId: 1,
    categoryId: 11,
    subCategoryId: 11,
    userId: "usr-01",
    userName: "Muhammad Bilal",
    userEmail: "bilal.student@gmail.com",
    rating: 5,
    title: "Best environment for university students",
    comment:
      "Rooms are clean and peaceful. High-speed WiFi is always working, and the mess food quality is surprisingly decent compared to other hostels near Baghdad-ul-Jadeed campus.",
    status: "approved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    ownerReply:
      "Thank you Bilal bhai! We always strive to maintain a calm study environment.",
    ownerRepliedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 2,
    listingId: 102,
    listingTitle: "Dr. Tariq Mahmood Clinic (Eye Specialist)",
    listingCategory: "Health > Doctors",
    parentCategoryId: 2,
    categoryId: 21,
    subCategoryId: 21,
    userId: "usr-02",
    userName: "Ayesha Siddiqua",
    userEmail: "ayesha.s@yahoo.com",
    rating: 4,
    title: "Great doctor, slightly long waiting time",
    comment:
      "Doctor is very competent and patiently explained the diagnostic details. Only concern was the waiting time exceeded 45 minutes even with an appointment.",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: 3,
    listingId: 103,
    listingTitle: "Chughtai & Co Legal Associates",
    listingCategory: "Professional Services > Lawyers",
    parentCategoryId: 4,
    categoryId: 41,
    subCategoryId: 41,
    userId: "usr-03",
    userName: "Hamza Farooq",
    userEmail: "hamza.f@gmail.com",
    rating: 1,
    title: "Unreachable contact number",
    comment:
      "Tried calling multiple times on the number provided. Nobody picked up all day. Needs verification.",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 4,
    listingId: 104,
    listingTitle: "Crown Palace Hotel & Banquet",
    listingCategory: "Hotels & Venues > Marriage Halls",
    parentCategoryId: 3,
    categoryId: 31,
    subCategoryId: 31,
    userId: "usr-04",
    userName: "Spam Bot 2026",
    userEmail: "crypto.investor@tempmail.org",
    rating: 5,
    title: "FREE CRYPTO SIGNUP",
    comment:
      "Visit this URL for free tokens and guaranteed 500% daily returns: http://spam-link.xyz",
    status: "rejected",
    rejectionReason: "Spam, advertisement, or promotional links",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: 5,
    listingId: 105,
    listingTitle: "Gulberg Fitness & Gym Center",
    listingCategory: "Fitness & Sports > Gyms",
    parentCategoryId: 5,
    categoryId: 51,
    subCategoryId: 51,
    userId: "usr-05",
    userName: "Zubair Ahmad",
    userEmail: "zubair.gym@gmail.com",
    rating: 5,
    title: "Modern equipment and certified trainers",
    comment:
      "Top-notch imported equipment and dedicated AC environment. Trainer Usman is especially very helpful for beginners.",
    status: "approved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

const BULK_REJECT_PRESETS = [
  "Inappropriate or abusive language",
  "Spam, advertisement, or promotional links",
  "Irrelevant or does not pertain to this listing",
  "Suspected fraudulent or competitor review",
  "Contains private personal contact information",
];

export const ReviewViewWrapper: React.FC<ReviewViewWrapperProps> = ({
  initialReviews,
  stats: initialStats,
  categories = DEFAULT_CATEGORIES,
}) => {
  const [isPending, startTransition] = useTransition();

  // Reviews state (sync with initialReviews when available)
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(
    initialReviews !== undefined ? initialReviews : MOCK_REVIEWS,
  );

  useEffect(() => {
    if (initialReviews !== undefined) {
      setReviewsList(initialReviews);
    }
  }, [initialReviews]);

  // Filter state
  const [filters, setFilters] = useState<ReviewFilters>({
    status: "all",
    rating: "all",
    search: "",
    categoryId: "all",
  });

  // Multi-Selection State
  const [selectedReviewIds, setSelectedReviewIds] = useState<number[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Auto-reset page and selection whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedReviewIds([]);
  }, [filters.status, filters.rating, filters.search, filters.categoryId]);

  // Modal states
  const [activeDetailReview, setActiveDetailReview] = useState<ReviewItem | null>(null);
  const [activeRejectReview, setActiveRejectReview] = useState<ReviewItem | null>(null);
  const [activeReplyReview, setActiveReplyReview] = useState<ReviewItem | null>(null);

  // Bulk Actions Modal States
  const [isBulkApproveOpen, setIsBulkApproveOpen] = useState(false);
  const [isBulkRejectOpen, setIsBulkRejectOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // 1. Scoped reviews matching category, search, and rating filters
  const scopedReviews = useMemo(() => {
    return reviewsList.filter((item) => {
      // (A) Category Filter (Hierarchical Grouped)
      if (filters.categoryId && filters.categoryId !== "all") {
        if (filters.categoryId.startsWith("parent-")) {
          const parentIdStr = filters.categoryId.replace("parent-", "");
          const parentCat = categories.find((c) => String(c.id) === parentIdStr);
          const subCatIds = new Set(
            (parentCat?.subCategories || []).map((s) => String(s.id)),
          );
          const parentName = parentCat?.name.toLowerCase();

          const matchesParentId =
            String(item.parentCategoryId) === parentIdStr ||
            String(item.categoryId) === parentIdStr ||
            (item.subCategoryId
              ? subCatIds.has(String(item.subCategoryId))
              : false);

          const matchesCategoryString = parentName
            ? item.listingCategory?.toLowerCase().includes(parentName)
            : false;

          if (!matchesParentId && !matchesCategoryString) {
            return false;
          }
        } else if (filters.categoryId.startsWith("sub-")) {
          const subIdStr = filters.categoryId.replace("sub-", "");
          let subCatName: string | undefined;

          for (const p of categories) {
            const found = p.subCategories?.find(
              (s) => String(s.id) === subIdStr,
            );
            if (found) {
              subCatName = found.name.toLowerCase();
              break;
            }
          }

          const matchesSubId =
            String(item.subCategoryId) === subIdStr ||
            String(item.categoryId) === subIdStr;

          const matchesSubString = subCatName
            ? item.listingCategory?.toLowerCase().includes(subCatName)
            : false;

          if (!matchesSubId && !matchesSubString) {
            return false;
          }
        }
      }

      // (B) Rating Filter
      if (
        filters.rating &&
        filters.rating !== "all" &&
        item.rating !== Number(filters.rating)
      ) {
        return false;
      }

      // (C) Smart Omnisearch Query (listing, user, comment, category, title)
      if (filters.search && filters.search.trim() !== "") {
        const query = filters.search.toLowerCase().trim();
        const matchesListing = item.listingTitle.toLowerCase().includes(query);
        const matchesUser = item.userName.toLowerCase().includes(query);
        const matchesComment = item.comment.toLowerCase().includes(query);
        const matchesTitle = item.title?.toLowerCase().includes(query) ?? false;
        const matchesCategory =
          item.listingCategory?.toLowerCase().includes(query) ?? false;

        if (
          !matchesListing &&
          !matchesUser &&
          !matchesComment &&
          !matchesTitle &&
          !matchesCategory
        ) {
          return false;
        }
      }

      return true;
    });
  }, [reviewsList, filters.categoryId, filters.rating, filters.search, categories]);

  // 2. Dynamic KPI stats calculated from the active scoped reviews
  const displayedStats: ReviewStats = useMemo(() => {
    const totalReviews = scopedReviews.length;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let totalRatingSum = 0;

    for (const r of scopedReviews) {
      if (r.status === "pending") pendingCount++;
      if (r.status === "approved") {
        approvedCount++;
        totalRatingSum += r.rating;
      }
      if (r.status === "rejected") rejectedCount++;
    }

    const averageRating =
      approvedCount > 0
        ? Number((totalRatingSum / approvedCount).toFixed(1))
        : 0;

    return {
      totalReviews,
      pendingCount,
      approvedCount,
      rejectedCount,
      averageRating,
    };
  }, [scopedReviews]);

  // 3. Final filtered reviews for the table (applying status pill filter on top of scoped reviews)
  const filteredReviews = useMemo(() => {
    if (filters.status && filters.status !== "all") {
      return scopedReviews.filter((item) => item.status === filters.status);
    }
    return scopedReviews;
  }, [scopedReviews, filters.status]);

  // 4. Client-side Paginated Slice
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReviews.slice(start, start + pageSize);
  }, [filteredReviews, currentPage, pageSize]);

  // Multi-Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = paginatedReviews.map((r) => r.id);
      setSelectedReviewIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    } else {
      const currentPageIdSet = new Set(paginatedReviews.map((r) => r.id));
      setSelectedReviewIds((prev) => prev.filter((id) => !currentPageIdSet.has(id)));
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedReviewIds((prev) => [...prev, id]);
    } else {
      setSelectedReviewIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Single Action Handlers with optimistic updates and Server Action execution
  const handleApprove = (id: number) => {
    const previous = [...reviewsList];
    setReviewsList((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "approved", rejectionReason: null } : r,
      ),
    );
    setSelectedReviewIds((prev) => prev.filter((item) => item !== id));

    startTransition(async () => {
      try {
        const res = await approveReviewAction(id);
        if (res.success) {
          toast.success(res.message);
        } else {
          setReviewsList(previous);
          toast.error(res.message);
        }
      } catch {
        setReviewsList(previous);
        toast.error("Failed to approve review.");
      }
    });
  };

  const handleRejectSubmit = (id: number, reason: string) => {
    const previous = [...reviewsList];
    setReviewsList((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "rejected", rejectionReason: reason } : r,
      ),
    );
    setActiveRejectReview(null);
    setSelectedReviewIds((prev) => prev.filter((item) => item !== id));

    startTransition(async () => {
      try {
        const res = await rejectReviewAction(id, reason);
        if (res.success) {
          toast.error(res.message);
        } else {
          setReviewsList(previous);
          toast.error(res.message);
        }
      } catch {
        setReviewsList(previous);
        toast.error("Failed to reject review.");
      }
    });
  };

  const handleReplySubmit = (id: number, replyText: string) => {
    const previous = [...reviewsList];
    setReviewsList((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ownerReply: replyText,
              ownerRepliedAt: new Date(),
            }
          : r,
      ),
    );
    setActiveReplyReview(null);

    startTransition(async () => {
      try {
        const res = await updateOwnerReplyAction(id, replyText);
        if (res.success) {
          toast.success(res.message);
        } else {
          setReviewsList(previous);
          toast.error(res.message);
        }
      } catch {
        setReviewsList(previous);
        toast.error("Failed to update owner reply.");
      }
    });
  };

  const handleDelete = (id: number) => {
    const previous = [...reviewsList];
    setReviewsList((prev) => prev.filter((r) => r.id !== id));
    setSelectedReviewIds((prev) => prev.filter((item) => item !== id));

    startTransition(async () => {
      try {
        const res = await deleteReviewAction(id);
        if (res.success) {
          toast.success(res.message);
        } else {
          setReviewsList(previous);
          toast.error(res.message);
        }
      } catch {
        setReviewsList(previous);
        toast.error("Failed to delete review.");
      }
    });
  };

  // Bulk Action Execution Handlers
  const handleBulkApproveConfirm = () => {
    const count = selectedReviewIds.length;
    const targetSet = new Set(selectedReviewIds);
    const previous = [...reviewsList];

    setReviewsList((prev) =>
      prev.map((r) =>
        targetSet.has(r.id)
          ? { ...r, status: "approved", rejectionReason: null }
          : r,
      ),
    );
    const idsToApprove = [...selectedReviewIds];
    setSelectedReviewIds([]);
    setIsBulkApproveOpen(false);

    startTransition(async () => {
      try {
        await Promise.all(idsToApprove.map((id) => approveReviewAction(id)));
        toast.success(`Successfully approved ${count} selected reviews.`);
      } catch {
        setReviewsList(previous);
        toast.error("Failed to bulk approve some reviews.");
      }
    });
  };

  const handleBulkRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkRejectReason.trim()) return;

    const count = selectedReviewIds.length;
    const targetSet = new Set(selectedReviewIds);
    const previous = [...reviewsList];
    const reason = bulkRejectReason.trim();

    setReviewsList((prev) =>
      prev.map((r) =>
        targetSet.has(r.id)
          ? { ...r, status: "rejected", rejectionReason: reason }
          : r,
      ),
    );
    const idsToReject = [...selectedReviewIds];
    setSelectedReviewIds([]);
    setIsBulkRejectOpen(false);
    setBulkRejectReason("");

    startTransition(async () => {
      try {
        await Promise.all(idsToReject.map((id) => rejectReviewAction(id, reason)));
        toast.error(`Successfully rejected ${count} selected reviews.`);
      } catch {
        setReviewsList(previous);
        toast.error("Failed to bulk reject some reviews.");
      }
    });
  };

  const handleBulkDeleteConfirm = () => {
    const count = selectedReviewIds.length;
    const targetSet = new Set(selectedReviewIds);
    const previous = [...reviewsList];

    setReviewsList((prev) => prev.filter((r) => !targetSet.has(r.id)));
    const idsToDelete = [...selectedReviewIds];
    setSelectedReviewIds([]);
    setIsBulkDeleteOpen(false);

    startTransition(async () => {
      try {
        await Promise.all(idsToDelete.map((id) => deleteReviewAction(id)));
        toast.success(`Successfully deleted ${count} selected reviews.`);
      } catch {
        setReviewsList(previous);
        toast.error("Failed to bulk delete some reviews.");
      }
    });
  };

  return (
    <div className="space-y-6 relative pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Reviews Moderation
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor, approve, reject customer reviews and manage public business replies.
          </p>
        </div>
      </div>

      {/* 2. KPI Stats Cards (Dynamic & Filter-Aware) */}
      <ReviewsStatsCards stats={displayedStats} />

      {/* 3. Filter Bar */}
      <ReviewsFilterBar
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
        pendingCount={displayedStats.pendingCount}
      />

      {/* 4. Table with Multi-Selection & Pagination */}
      <ReviewsTable
        reviews={paginatedReviews}
        selectedIds={selectedReviewIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredReviews.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onApprove={handleApprove}
        onRejectClick={(r) => setActiveRejectReview(r)}
        onReplyClick={(r) => setActiveReplyReview(r)}
        onViewDetail={(r) => setActiveDetailReview(r)}
        onDelete={handleDelete}
      />

      {/* 5. Floating Bottom Bulk Actions Bar */}
      {selectedReviewIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card/95 backdrop-blur-md border border-border shadow-2xl px-4 py-2.5 rounded-full animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-2 border-r border-border">
            <Badge
              variant="default"
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground"
            >
              {selectedReviewIds.length}
            </Badge>
            <span className="text-xs font-medium text-foreground whitespace-nowrap">
              selected
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              onClick={() => setSelectedReviewIds([])}
              title="Clear Selection"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => setIsBulkApproveOpen(true)}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-full px-3"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Bulk Approve</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsBulkRejectOpen(true)}
              className="h-8 text-xs text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 rounded-full px-3"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>Bulk Reject</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => setIsBulkDeleteOpen(true)}
              className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1.5 rounded-full px-3"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Bulk Delete</span>
            </Button>
          </div>
        </div>
      )}

      {/* 6. Modals (Detail, Single Reject, Owner Reply) */}
      <ReviewDetailModal
        review={activeDetailReview}
        isOpen={Boolean(activeDetailReview)}
        onClose={() => setActiveDetailReview(null)}
        onApprove={handleApprove}
        onRejectClick={(r) => {
          setActiveDetailReview(null);
          setActiveRejectReview(r);
        }}
        onReplyClick={(r) => {
          setActiveDetailReview(null);
          setActiveReplyReview(r);
        }}
      />

      <RejectReasonModal
        review={activeRejectReview}
        isOpen={Boolean(activeRejectReview)}
        onClose={() => setActiveRejectReview(null)}
        onSubmit={handleRejectSubmit}
        isSubmitting={isPending}
      />

      <OwnerReplyModal
        review={activeReplyReview}
        isOpen={Boolean(activeReplyReview)}
        onClose={() => setActiveReplyReview(null)}
        onSubmit={handleReplySubmit}
        isSubmitting={isPending}
      />

      {/* 7. Bulk Action Modals */}
      {/* (A) Bulk Approve Confirmation */}
      <AlertDialog open={isBulkApproveOpen} onOpenChange={setIsBulkApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <AlertDialogTitle className="text-base font-semibold">
                Approve {selectedReviewIds.length} Selected Reviews?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-2 pt-2">
              <span className="block">
                You are about to approve <strong>{selectedReviewIds.length}</strong> customer
                reviews.
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Approved reviews will become publicly visible on listings and update
                  the aggregated average ratings.
                </span>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleBulkApproveConfirm}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
            >
              Approve {selectedReviewIds.length} Reviews
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* (B) Bulk Reject Reason Modal */}
      <Dialog open={isBulkRejectOpen} onOpenChange={setIsBulkRejectOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <XCircle className="h-5 w-5" />
              <DialogTitle className="text-base font-semibold">
                Bulk Reject {selectedReviewIds.length} Selected Reviews
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide a common rejection reason that will be applied to all{" "}
              {selectedReviewIds.length} selected reviews.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBulkRejectSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Quick Selection Presets
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {BULK_REJECT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBulkRejectReason(preset)}
                    className={`text-[11px] px-2 py-1 rounded-md border transition-all text-left ${
                      bulkRejectReason === preset
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/40 font-medium"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bulk-review-reject-reason" className="text-xs font-medium text-foreground">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="bulk-review-reject-reason"
                rows={3}
                placeholder="Reason for rejecting these customer reviews..."
                value={bulkRejectReason}
                onChange={(e) => setBulkRejectReason(e.target.value)}
                required
                className="text-xs bg-background resize-y"
              />
            </div>

            <DialogFooter className="pt-2 flex sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBulkRejectOpen(false)}
                disabled={isPending}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!bulkRejectReason.trim() || isPending}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
              >
                Reject {selectedReviewIds.length} Reviews
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* (C) Bulk Delete Confirmation */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              <AlertDialogTitle className="text-base font-semibold">
                Delete {selectedReviewIds.length} Reviews?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground pt-2">
              Are you sure you want to permanently delete{" "}
              <strong>{selectedReviewIds.length}</strong> selected customer reviews?
              This action cannot be undone and will recalculate the listings&apos; ratings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleBulkDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-medium"
            >
              Delete {selectedReviewIds.length} Reviews
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReviewViewWrapper;
