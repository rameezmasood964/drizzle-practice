"use client";

import React from "react";
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
import { ShieldCheck, AlertCircle } from "lucide-react";
import type { ApproveClaimDialogProps } from "../../types";

export const ApproveClaimDialog: React.FC<ApproveClaimDialogProps> = ({
  claim,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!claim) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
            <AlertDialogTitle className="text-base font-semibold">
              Approve Ownership Claim?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground space-y-2 pt-2">
            <span className="block">
              Are you sure you want to approve this claim? Listing ownership for{" "}
              <strong className="text-foreground">&quot;{claim.listingTitle}&quot;</strong>{" "}
              will be assigned to{" "}
              <strong className="text-foreground">{claim.claimantName}</strong> ({claim.claimantEmail}),
              and the business will be marked as <strong className="text-foreground">Claimed</strong>.
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>
                The claimant will gain owner management permissions for this listing.
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting} className="text-xs">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={(e) => {
              e.preventDefault();
              onConfirm(claim.id);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
          >
            {isSubmitting ? "Approving..." : "Confirm Approval"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApproveClaimDialog;

