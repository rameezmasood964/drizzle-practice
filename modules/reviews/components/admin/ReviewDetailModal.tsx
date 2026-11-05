"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  User,
  Store,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  CornerDownRight,
  AlertCircle,
} from "lucide-react";
import ReviewStatusBadge from "./ReviewStatusBadge";
import type { ReviewDetailModalProps } from "../../types";

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  review,
  isOpen,
  onClose,
  onApprove,
  onRejectClick,
  onReplyClick,
}) => {
  if (!review) return null;

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const formattedReplyDate = review.ownerRepliedAt
    ? new Date(review.ownerRepliedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>Review Details</span>
            </DialogTitle>
            <ReviewStatusBadge status={review.status} />
          </div>
          <DialogDescription>
            Detailed inspection of customer feedback and moderation status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Listing & User Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border border-border">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5" />
                <span>Listing</span>
              </span>
              <p className="font-semibold text-foreground leading-snug">
                {review.listingTitle}
              </p>
              {review.listingCategory && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {review.listingCategory}
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>Reviewer</span>
              </span>
              <p className="font-semibold text-foreground leading-snug">
                {review.userName}
              </p>
              {review.userEmail && (
                <p className="text-xs text-muted-foreground truncate">
                  {review.userEmail}
                </p>
              )}
            </div>
          </div>

          {/* Rating & Submission Time */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-foreground ml-1">
                {review.rating}.0
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Review Title & Content */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border bg-card">
            {review.title && (
              <h4 className="font-bold text-foreground text-sm">
                &ldquo;{review.title}&rdquo;
              </h4>
            )}
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
              {review.comment}
            </p>
          </div>

          {/* Rejection Reason (if rejected) */}
          {review.status === "rejected" && review.rejectionReason && (
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <AlertCircle className="h-4 w-4" />
                <span>Rejection Reason (Internal / Admin Note):</span>
              </div>
              <p className="text-xs leading-relaxed">{review.rejectionReason}</p>
            </div>
          )}

          {/* Owner Reply (if exists) */}
          {review.ownerReply ? (
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <CornerDownRight className="h-3.5 w-3.5 text-primary" />
                  Management / Owner Response:
                </span>
                {formattedReplyDate && <span>{formattedReplyDate}</span>}
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap pl-5 border-l-2 border-primary/40 italic">
                {review.ownerReply}
              </p>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic px-1">
              No management response recorded yet.
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Owner Reply Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onReplyClick(review);
              }}
              className="text-xs gap-1.5 flex-1 sm:flex-initial"
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              <span>{review.ownerReply ? "Edit Reply" : "Reply as Owner"}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
            {review.status !== "approved" && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => {
                  onApprove(review.id);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 flex-1 sm:flex-initial"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve Review</span>
              </Button>
            )}

            {review.status !== "rejected" && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onClose();
                  onRejectClick(review);
                }}
                className="text-xs gap-1.5 flex-1 sm:flex-initial"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject...</span>
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDetailModal;

