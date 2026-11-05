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
import type { RejectReasonModalProps } from "../../types";

const REJECTION_PRESETS = [
  "Inappropriate or abusive language",
  "Spam, advertisement, or promotional links",
  "Irrelevant or does not pertain to this listing",
  "Suspected fraudulent or competitor review",
  "Contains private personal contact information",
];

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  review,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (review) {
      setReason(review.rejectionReason || "");
    } else {
      setReason("");
    }
  }, [review, isOpen]);

  if (!review) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(review.id, reason.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span>Reject Review</span>
            </DialogTitle>
            <DialogDescription>
              Provide an administrative reason for rejecting the review on &ldquo;
              {review.listingTitle}&rdquo; by {review.userName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Quick Reason Presets */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span>Common Presets:</span>
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {REJECTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setReason(preset)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors cursor-pointer text-left ${
                      reason === preset
                        ? "border-destructive bg-destructive/10 text-destructive font-medium"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea */}
            <div className="space-y-1.5">
              <Label htmlFor="rejectReasonText" className="text-xs font-medium">
                Administrative Rejection Reason:
              </Label>
              <Textarea
                id="rejectReasonText"
                rows={3}
                placeholder="Explain why this review violates platform guidelines..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none text-xs bg-background"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isSubmitting || !reason.trim()}
              className="text-xs gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Rejecting..." : "Confirm Rejection"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RejectReasonModal;

