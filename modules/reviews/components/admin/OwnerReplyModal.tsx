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
import { CornerDownRight, MessageSquareQuote } from "lucide-react";
import type { OwnerReplyModalProps } from "../../types";

export const OwnerReplyModal: React.FC<OwnerReplyModalProps> = ({
  review,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (review) {
      setReply(review.ownerReply || "");
    } else {
      setReply("");
    }
  }, [review, isOpen]);

  if (!review) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(review.id, reply.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CornerDownRight className="h-5 w-5 text-primary" />
              <span>
                {review.ownerReply
                  ? "Edit Management Response"
                  : "Reply to Review as Management"}
              </span>
            </DialogTitle>
            <DialogDescription>
              This response will appear publicly beneath the customer review for &ldquo;
              {review.listingTitle}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Customer Review Excerpt for Reference */}
            <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <MessageSquareQuote className="h-3.5 w-3.5 text-muted-foreground" />
                Review by {review.userName} ({review.rating} Stars):
              </span>
              <p className="text-muted-foreground italic line-clamp-3">
                &ldquo;{review.comment}&rdquo;
              </p>
            </div>

            {/* Response Textarea */}
            <div className="space-y-1.5">
              <Label htmlFor="ownerReplyText" className="text-xs font-medium">
                Official Business Response:
              </Label>
              <Textarea
                id="ownerReplyText"
                rows={4}
                placeholder="Thank you for your feedback! We are delighted to hear about your experience..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
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
              variant="default"
              size="sm"
              disabled={isSubmitting || !reply.trim()}
              className="text-xs gap-1.5"
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Saving..." : "Save Public Response"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OwnerReplyModal;

