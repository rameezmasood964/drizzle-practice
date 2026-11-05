"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Ban,
  Trash2,
  X,
  AlertCircle,
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

import ClaimsStatsCards from "../admin/ClaimsStatsCards";
import ClaimsFilterBar, { DEFAULT_CATEGORIES } from "../admin/ClaimsFilterBar";
import ClaimsTable from "../admin/ClaimsTable";
import ClaimDetailModal from "../admin/ClaimDetailModal";
import ApproveClaimDialog from "../admin/ApproveClaimDialog";
import RejectClaimModal from "../admin/RejectClaimModal";
import {
  approveClaimAction,
  rejectClaimAction,
  deleteClaimAction,
  bulkApproveClaimsAction,
  bulkRejectClaimsAction,
  bulkDeleteClaimsAction,
} from "../../actions/claimActions";
import type {
  ClaimItem,
  ClaimStats,
  ClaimFilters,
  ClaimViewWrapperProps,
} from "../../types";

const MOCK_CLAIMS: ClaimItem[] = [
  {
    id: 1,
    listingId: 5,
    listingTitle: "Al-Rehman Boys Hostel Baghdad Campus",
    listingSlug: "al-rehman-boys-hostel-baghdad-campus",
    categoryName: "Hostels > Boys Hostels",
    userId: "usr-claim-01",
    claimantName: "Chaudhry Tariq Mehmood",
    claimantEmail: "tariq.hostels@gmail.com",
    claimantPhone: "03001234567",
    claimantRole: "Owner / Proprietor",
    proofDocumentUrl:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    notes:
      "I am the registered owner of this property. Attached is the utility bill and registration deed under my name.",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: 2,
    listingId: 7,
    listingTitle: "Dr. Jameel Eye Care & Surgical Center",
    listingSlug: "dr-jameel-eye-care-center",
    categoryName: "Doctors > Eye Specialists",
    userId: "usr-claim-02",
    claimantName: "Dr. Jameel Akhtar",
    claimantEmail: "dr.jameel@eyecarebwp.com",
    claimantPhone: "03217654321",
    claimantRole: "Doctor / Founder",
    proofDocumentUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    notes:
      "This is my personal clinic listing created previously by a patient. Requesting administrative ownership to manage contact hours and appointments.",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
  },
  {
    id: 3,
    listingId: 8,
    listingTitle: "Royal Spice Restaurant & BBQ",
    listingSlug: "royal-spice-restaurant-bbq",
    categoryName: "Resturants > Traditional BBQ",
    userId: "usr-claim-03",
    claimantName: "Salman Khan",
    claimantEmail: "salman.royalspice@yahoo.com",
    claimantPhone: "03029876543",
    claimantRole: "General Manager",
    proofDocumentUrl:
      "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    notes:
      "Authorized by management to handle online profiles, menus, and customer inquiries.",
    status: "approved",
    reviewedByName: "Admin",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: 4,
    listingId: 10,
    listingTitle: "Farooq & Partners Legal Chambers",
    listingSlug: "farooq-partners-legal-chambers",
    categoryName: "Lawyers > Civil Lawyers",
    userId: "usr-claim-04",
    claimantName: "Imran Khan Niazi",
    claimantEmail: "unknown.claimant@gmail.com",
    claimantPhone: "03335555555",
    claimantRole: "Marketing Agent",
    proofDocumentUrl: null,
    notes: "I want to edit the phone number for marketing purposes.",
    status: "rejected",
    rejectionReason:
      "Unauthorized representative and no official legal authority letter provided.",
    reviewedByName: "Admin",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
  },
];

const BULK_REJECT_PRESETS = [
  "Incomplete document proof",
  "Phone number unreachable",
  "Mismatched business entity",
  "Unauthorized representative",
  "Duplicate claim submission",
];

export const ClaimViewWrapper: React.FC<ClaimViewWrapperProps> = ({
  initialClaims,
  stats: initialStats,
  categories = DEFAULT_CATEGORIES,
}) => {
  const [isPending, startTransition] = useTransition();

  // Use provided initialClaims if defined, otherwise use mock claims fallback
  const [claimsList, setClaimsList] = useState<ClaimItem[]>(
    initialClaims !== undefined ? initialClaims : MOCK_CLAIMS,
  );

  useEffect(() => {
    if (initialClaims !== undefined) {
      setClaimsList(initialClaims);
    }
  }, [initialClaims]);

  // Filter state
  const [filters, setFilters] = useState<ClaimFilters>({
    status: "all",
    search: "",
    category: "all",
  });

  // Multi-Selection State
  const [selectedClaimIds, setSelectedClaimIds] = useState<number[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Auto-reset page and selection whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedClaimIds([]);
  }, [filters.status, filters.search, filters.category]);

  // Modal states
  const [selectedClaimForDetail, setSelectedClaimForDetail] =
    useState<ClaimItem | null>(null);
  const [claimToApprove, setClaimToApprove] = useState<ClaimItem | null>(null);
  const [claimToReject, setClaimToReject] = useState<ClaimItem | null>(null);

  // Bulk Action Modal States
  const [isBulkApproveOpen, setIsBulkApproveOpen] = useState(false);
  const [isBulkRejectOpen, setIsBulkRejectOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // 1. Scoped claims matching search and category filter (used for dynamic stats calculation)
  const scopedClaims = useMemo(() => {
    return claimsList.filter((item) => {
      // (A) Category Filter (Hierarchical Grouped)
      if (filters.category && filters.category !== "all") {
        if (filters.category.startsWith("parent-")) {
          const parentIdStr = filters.category.replace("parent-", "");
          const parentCat = categories.find((c) => String(c.id) === parentIdStr);
          const parentName = parentCat?.name.toLowerCase();

          if (
            parentName &&
            !item.categoryName?.toLowerCase().includes(parentName)
          ) {
            return false;
          }
        } else if (filters.category.startsWith("sub-")) {
          const subIdStr = filters.category.replace("sub-", "");
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

          if (
            subCatName &&
            !item.categoryName?.toLowerCase().includes(subCatName)
          ) {
            return false;
          }
        }
      }

      // (B) Omnisearch (listing, claimant, email, phone)
      if (filters.search && filters.search.trim() !== "") {
        const query = filters.search.toLowerCase().trim();
        const matchesListing = item.listingTitle.toLowerCase().includes(query);
        const matchesClaimant = item.claimantName.toLowerCase().includes(query);
        const matchesEmail = item.claimantEmail.toLowerCase().includes(query);
        const matchesPhone = item.claimantPhone.includes(query);
        const matchesCategory =
          item.categoryName?.toLowerCase().includes(query) ?? false;

        if (
          !matchesListing &&
          !matchesClaimant &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesCategory
        ) {
          return false;
        }
      }

      return true;
    });
  }, [claimsList, filters.category, filters.search, categories]);

  // 2. Dynamic KPI stats calculated from scoped claims
  const displayedStats: ClaimStats = useMemo(() => {
    const totalClaims = scopedClaims.length;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    for (const c of scopedClaims) {
      if (c.status === "pending") pendingCount++;
      if (c.status === "approved") approvedCount++;
      if (c.status === "rejected") rejectedCount++;
    }

    return {
      totalClaims,
      pendingCount,
      approvedCount,
      rejectedCount,
    };
  }, [scopedClaims]);

  // 3. Final filtered claims (applying status pill filter on top of scoped claims)
  const filteredClaims = useMemo(() => {
    if (filters.status && filters.status !== "all") {
      return scopedClaims.filter((item) => item.status === filters.status);
    }
    return scopedClaims;
  }, [scopedClaims, filters.status]);

  // 4. Client-side Paginated Slice
  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClaims.slice(start, start + pageSize);
  }, [filteredClaims, currentPage, pageSize]);

  // Multi-Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = paginatedClaims.map((c) => c.id);
      setSelectedClaimIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    } else {
      const currentPageIdSet = new Set(paginatedClaims.map((c) => c.id));
      setSelectedClaimIds((prev) => prev.filter((id) => !currentPageIdSet.has(id)));
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedClaimIds((prev) => [...prev, id]);
    } else {
      setSelectedClaimIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Single Action Handlers with optimistic UI and Server Action execution
  const handleApprove = (claimId: number) => {
    const previous = [...claimsList];
    setClaimsList((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: "approved",
              rejectionReason: null,
              reviewedByName: "Admin",
              reviewedAt: new Date(),
            }
          : c,
      ),
    );
    setClaimToApprove(null);
    setSelectedClaimIds((prev) => prev.filter((id) => id !== claimId));

    startTransition(async () => {
      try {
        const res = await approveClaimAction(claimId);
        if (res.success) {
          toast.success(res.message);
        } else {
          setClaimsList(previous);
          toast.error(res.message);
        }
      } catch {
        setClaimsList(previous);
        toast.error("Failed to approve claim.");
      }
    });
  };

  const handleReject = (claimId: number, reason: string) => {
    const previous = [...claimsList];
    setClaimsList((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: "rejected",
              rejectionReason: reason,
              reviewedByName: "Admin",
              reviewedAt: new Date(),
            }
          : c,
      ),
    );
    setClaimToReject(null);
    setSelectedClaimIds((prev) => prev.filter((id) => id !== claimId));

    startTransition(async () => {
      try {
        const res = await rejectClaimAction(claimId, reason);
        if (res.success) {
          toast.error(res.message);
        } else {
          setClaimsList(previous);
          toast.error(res.message);
        }
      } catch {
        setClaimsList(previous);
        toast.error("Failed to reject claim.");
      }
    });
  };

  const handleDelete = (claim: ClaimItem) => {
    const previous = [...claimsList];
    setClaimsList((prev) => prev.filter((c) => c.id !== claim.id));
    setSelectedClaimIds((prev) => prev.filter((id) => id !== claim.id));

    startTransition(async () => {
      try {
        const res = await deleteClaimAction(claim.id);
        if (res.success) {
          toast.success(res.message);
        } else {
          setClaimsList(previous);
          toast.error(res.message);
        }
      } catch {
        setClaimsList(previous);
        toast.error("Failed to delete claim.");
      }
    });
  };

  // Bulk Action Execution Handlers with optimistic UI and Server Action execution
  const handleBulkApproveConfirm = () => {
    const count = selectedClaimIds.length;
    const targetSet = new Set(selectedClaimIds);
    const previous = [...claimsList];

    setClaimsList((prev) =>
      prev.map((c) =>
        targetSet.has(c.id)
          ? {
              ...c,
              status: "approved",
              rejectionReason: null,
              reviewedByName: "Admin",
              reviewedAt: new Date(),
            }
          : c,
      ),
    );
    const idsToApprove = [...selectedClaimIds];
    setSelectedClaimIds([]);
    setIsBulkApproveOpen(false);

    startTransition(async () => {
      try {
        const res = await bulkApproveClaimsAction(idsToApprove);
        if (res.success) {
          toast.success(res.message);
        } else {
          setClaimsList(previous);
          toast.error(res.message);
        }
      } catch {
        setClaimsList(previous);
        toast.error("Failed to bulk approve claims.");
      }
    });
  };

  const handleBulkRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkRejectReason.trim()) return;

    const count = selectedClaimIds.length;
    const targetSet = new Set(selectedClaimIds);
    const previous = [...claimsList];
    const reason = bulkRejectReason.trim();

    setClaimsList((prev) =>
      prev.map((c) =>
        targetSet.has(c.id)
          ? {
              ...c,
              status: "rejected",
              rejectionReason: reason,
              reviewedByName: "Admin",
              reviewedAt: new Date(),
            }
          : c,
      ),
    );
    const idsToReject = [...selectedClaimIds];
    setSelectedClaimIds([]);
    setIsBulkRejectOpen(false);
    setBulkRejectReason("");

    startTransition(async () => {
      try {
        const res = await bulkRejectClaimsAction(idsToReject, reason);
        if (res.success) {
          toast.error(res.message);
        } else {
          setClaimsList(previous);
          toast.error(res.message);
        }
      } catch {
        setClaimsList(previous);
        toast.error("Failed to bulk reject claims.");
      }
    });
  };

  const handleBulkDeleteConfirm = () => {
    const count = selectedClaimIds.length;
    const targetSet = new Set(selectedClaimIds);
    const previous = [...claimsList];

    setClaimsList((prev) => prev.filter((c) => !targetSet.has(c.id)));
    const idsToDelete = [...selectedClaimIds];
    setSelectedClaimIds([]);
    setIsBulkDeleteOpen(false);

    startTransition(async () => {
      try {
        const res = await bulkDeleteClaimsAction(idsToDelete);
        if (res.success) {
          toast.success(res.message);
        } else {
          setClaimsList(previous);
          toast.error(res.message);
        }
      } catch {
        setClaimsList(previous);
        toast.error("Failed to bulk delete claims.");
      }
    });
  };

  return (
    <div className="space-y-6 relative pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Business Claim Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            Verify business ownership requests, inspect identity proofs, and manage
            claimed listings.
          </p>
        </div>
      </div>

      {/* 2. KPI Stats Cards (Dynamic & Filter-Aware) */}
      <ClaimsStatsCards stats={displayedStats} />

      {/* 3. Filter Bar */}
      <ClaimsFilterBar
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
        pendingCount={displayedStats.pendingCount}
      />

      {/* 4. Table with Multi-Selection & Pagination */}
      <ClaimsTable
        claims={paginatedClaims}
        selectedIds={selectedClaimIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredClaims.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onViewDetail={(claim) => setSelectedClaimForDetail(claim)}
        onApproveClick={(claim) => setClaimToApprove(claim)}
        onRejectClick={(claim) => setClaimToReject(claim)}
        onDeleteClick={handleDelete}
      />

      {/* 5. Floating Bottom Bulk Actions Bar */}
      {selectedClaimIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card/95 backdrop-blur-md border border-border shadow-2xl px-4 py-2.5 rounded-full animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-2 border-r border-border">
            <Badge
              variant="default"
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground"
            >
              {selectedClaimIds.length}
            </Badge>
            <span className="text-xs font-medium text-foreground whitespace-nowrap">
              selected
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              onClick={() => setSelectedClaimIds([])}
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
              <ShieldCheck className="h-3.5 w-3.5" />
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

      {/* 6. Modals (Detail, Single Approve, Single Reject) */}
      <ClaimDetailModal
        claim={selectedClaimForDetail}
        isOpen={Boolean(selectedClaimForDetail)}
        onClose={() => setSelectedClaimForDetail(null)}
        onApproveClick={(claim) => setClaimToApprove(claim)}
        onRejectClick={(claim) => setClaimToReject(claim)}
      />

      <ApproveClaimDialog
        claim={claimToApprove}
        isOpen={Boolean(claimToApprove)}
        onClose={() => setClaimToApprove(null)}
        onConfirm={handleApprove}
        isSubmitting={isPending}
      />

      <RejectClaimModal
        claim={claimToReject}
        isOpen={Boolean(claimToReject)}
        onClose={() => setClaimToReject(null)}
        onSubmit={handleReject}
        isSubmitting={isPending}
      />

      {/* 7. Bulk Action Modals */}
      {/* (A) Bulk Approve Confirmation */}
      <AlertDialog open={isBulkApproveOpen} onOpenChange={setIsBulkApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
              <AlertDialogTitle className="text-base font-semibold">
                Approve {selectedClaimIds.length} Selected Claims?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-2 pt-2">
              <span className="block">
                You are about to approve <strong>{selectedClaimIds.length}</strong> business
                ownership claims simultaneously.
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  All corresponding listings will be marked as Claimed and assigned to
                  their respective claimants.
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
              Approve {selectedClaimIds.length} Claims
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* (B) Bulk Reject Reason Modal */}
      <Dialog open={isBulkRejectOpen} onOpenChange={setIsBulkRejectOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Ban className="h-5 w-5" />
              <DialogTitle className="text-base font-semibold">
                Bulk Reject {selectedClaimIds.length} Selected Claims
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide a common rejection reason that will be applied to all{" "}
              {selectedClaimIds.length} selected claims.
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
              <Label htmlFor="bulk-reject-reason" className="text-xs font-medium text-foreground">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="bulk-reject-reason"
                rows={3}
                placeholder="Reason for rejecting these claims..."
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
                Reject {selectedClaimIds.length} Claims
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
                Delete {selectedClaimIds.length} Claims?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground pt-2">
              Are you sure you want to permanently delete{" "}
              <strong>{selectedClaimIds.length}</strong> selected claim requests?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleBulkDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-medium"
            >
              Delete {selectedClaimIds.length} Claims
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClaimViewWrapper;
