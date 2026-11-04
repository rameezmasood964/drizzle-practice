"use client";

import * as React from "react";
import { Star, MessageSquarePlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ListingReviewsSummaryProps {
  rating: number;
  reviewCount: number;
  reviews?: ReviewItem[];
}

const RATING_DISTRIBUTION = [
  { stars: 5, percentage: 75, count: 18 },
  { stars: 4, percentage: 15, count: 4 },
  { stars: 3, percentage: 8, count: 2 },
  { stars: 2, percentage: 0, count: 0 },
  { stars: 1, percentage: 0, count: 0 },
];

export function ListingReviewsSummary({
  rating,
  reviewCount,
  reviews = [],
}: ListingReviewsSummaryProps) {
  const [userRating, setUserRating] = React.useState<number>(5);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const [reviewComment, setReviewComment] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setReviewComment("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
      <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
        Reviews & Ratings
      </h2>

      {/* Top Rating Breakdown Card */}
      <div className="grid grid-cols-1 gap-6 rounded-xl border border-border bg-muted/30 p-5 md:grid-cols-3">
        {/* Left: Overall Big Score */}
        <div className="flex flex-col items-center justify-center border-b border-border pb-4 md:border-b-0 md:border-r md:pr-6 md:pb-0">
          <span className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            {rating.toFixed(1)}
          </span>
          <div className="mt-2 flex items-center gap-1 text-primary">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "size-4",
                  star <= Math.round(rating)
                    ? "fill-primary text-primary"
                    : "fill-muted text-muted-foreground/40"
                )}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Based on {reviewCount} verified reviews
          </p>
        </div>

        {/* Right: Progress Breakdown */}
        <div className="space-y-2 md:col-span-2">
          {RATING_DISTRIBUTION.map((item) => (
            <div key={item.stars} className="flex items-center gap-3 text-xs">
              <span className="flex w-12 items-center gap-1 font-medium text-foreground">
                <span>{item.stars}</span>
                <Star className="size-3 fill-primary text-primary" />
              </span>
              <div className="flex-1">
                <Progress value={item.percentage} className="h-2" />
              </div>
              <span className="w-8 text-right text-muted-foreground">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 divide-y divide-border pt-2">
        {reviews.map((rev) => (
          <div key={rev.id} className="pt-4 first:pt-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {/* Avatar Initials */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {rev.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {rev.author}
                  </h4>
                  <span className="text-xs text-muted-foreground">{rev.date}</span>
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5 text-primary">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "size-3.5",
                      star <= rev.rating
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            </div>

            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {rev.comment}
            </p>
          </div>
        ))}
      </div>

      {/* Write a Review Section */}
      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquarePlus className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Share Your Experience
          </h3>
        </div>

        {submitted ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="size-4" />
            <span>Thank you! Your verified review has been submitted for approval.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Interactive Stars Selection */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => {
                const activeVal = hoverRating ?? userRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-0.5 text-primary focus:outline-none transition-transform hover:scale-110"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={cn(
                        "size-5",
                        star <= activeVal
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted-foreground/30"
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <Textarea
              placeholder="Write an honest review about food quality, environment, or hostel facilities..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="min-h-[85px] text-xs sm:text-sm bg-background"
            />

            <Button
              type="submit"
              size="sm"
              disabled={!reviewComment.trim()}
              className="font-medium"
            >
              Submit Review
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

export default ListingReviewsSummary;

