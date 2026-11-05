"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, AlertTriangle } from "lucide-react";
import type { RejectClaimModalProps } from "../../types";

const REJECTION_PRESETS = [
  "Incomplete document proof",
  "Phone number unreachable",
  "Mismatched business entity",
  "Unauthorized representative",
  "Proof document expired or unreadable",
  "Duplicate claim submission",
];

export const RejectClaimModal: React.FC<RejectClaimModalProps> = ({
  claim,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (claim) {
      setReason(claim.rejectionReason || "");
    } else {
      setReason("");
    }
  }, [claim, isOpen]);

  if (!claim) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit(claim.id, reason.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <XCircle className="h-5 w-5" />
            <DialogTitle className="text-base font-semibold">
              Reject Business Ownership Claim
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Provide a clear rejection reason for &quot;{claim.listingTitle}&quot;
            submitted by {claim.claimantName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Quick presets */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Quick Selection Presets
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {REJECTION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className={`text-[11px] px-2 py-1 rounded-md border transition-all text-left ${
                    reason === preset
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/40 font-medium"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Reason textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="claim-reject-reason" className="text-xs font-medium text-foreground">
              Rejection Reason Explanation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="claim-reject-reason"
              rows={3}
              placeholder="Explain why this ownership claim cannot be verified..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="text-xs bg-background resize-y"
            />
          </div>

          <div className="rounded-md bg-muted/40 p-2.5 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This explanation will be recorded in the system audit log and displayed
              to the user.
            </p>
          </div>

          <DialogFooter className="pt-2 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!reason.trim() || isSubmitting}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RejectClaimModal;

