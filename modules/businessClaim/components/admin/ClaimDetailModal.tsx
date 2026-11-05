"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  XCircle,
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  ExternalLink,
  AlertTriangle,
  BadgeAlert,
} from "lucide-react";
import ClaimStatusBadge from "./ClaimStatusBadge";
import type { ClaimDetailModalProps } from "../../types";

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  claim,
  isOpen,
  onClose,
  onApproveClick,
  onRejectClick,
}) => {
  if (!claim) return null;

  const formattedDate = claim.createdAt
    ? new Date(claim.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const isImageUrl = (url?: string | null) => {
    if (!url) return false;
    return (
      url.match(/\.(jpeg|jpg|png|webp|gif|svg)($|\?)/i) ||
      url.includes("/storage/v1/object/public/")
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Business Ownership Claim</span>
            </DialogTitle>
            <ClaimStatusBadge status={claim.status} />
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Submitted on {formattedDate} • Claim ID #{claim.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 1. Rejection Notice if rejected */}
          {claim.status === "rejected" && claim.rejectionReason && (
            <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
              <BadgeAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">Claim Rejected</p>
                <p className="leading-relaxed">{claim.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* 2. 2-Column Grid: Listing Meta vs Claimant Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Listing Meta */}
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>Target Business Listing</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">
                    {claim.listingTitle}
                  </h4>
                  {claim.listingSlug && (
                    <Link
                      href={`/listings/${claim.listingSlug}`}
                      target="_blank"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                {claim.categoryName && (
                  <p className="text-xs text-muted-foreground">
                    Category:{" "}
                    <span className="font-medium text-foreground">
                      {claim.categoryName}
                    </span>
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Listing ID:{" "}
                  <span className="font-mono text-foreground">
                    #{claim.listingId}
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Claimant Profile */}
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Claimant Identity</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-semibold text-foreground">
                    {claim.claimantName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Role / Position:</span>
                  <span className="font-medium text-foreground bg-background px-2 py-0.5 rounded border border-border text-[11px]">
                    {claim.claimantRole}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <a
                    href={`tel:${claim.claimantPhone}`}
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{claim.claimantPhone}</span>
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <a
                    href={`mailto:${claim.claimantEmail}`}
                    className="font-medium text-primary hover:underline flex items-center gap-1 truncate max-w-[180px]"
                  >
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{claim.claimantEmail}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Claimant Notes / Justification Message */}
          {claim.notes && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Claimant Statement / Notes</span>
              </label>
              <div className="rounded-md border border-border bg-background p-3 text-xs leading-relaxed text-foreground whitespace-pre-line">
                {claim.notes}
              </div>
            </div>
          )}

          {/* 4. Verification Document Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Document Proof / Verification</span>
              </label>
              {claim.proofDocumentUrl && (
                <a
                  href={claim.proofDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <span>Open Full Size</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {claim.proofDocumentUrl ? (
              isImageUrl(claim.proofDocumentUrl) ? (
                <div className="rounded-lg border border-border bg-muted/10 p-2 overflow-hidden flex items-center justify-center max-h-72">
                  <img
                    src={claim.proofDocumentUrl}
                    alt="Proof of Business Ownership"
                    className="max-h-64 object-contain rounded"
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted/20 p-4 text-center space-y-2">
                  <FileText className="h-8 w-8 text-primary mx-auto" />
                  <p className="text-xs font-medium text-foreground">
                    Attachment Available
                  </p>
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <a
                      href={claim.proofDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download Document
                    </a>
                  </Button>
                </div>
              )
            ) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No identity or business verification document was attached with this
                claim.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border flex sm:justify-between items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            {claim.status !== "rejected" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onRejectClick(claim);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30 gap-1.5"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject Claim...</span>
              </Button>
            )}

            {claim.status !== "approved" && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose();
                  onApproveClick(claim);
                }}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Approve Claim</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimDetailModal;

