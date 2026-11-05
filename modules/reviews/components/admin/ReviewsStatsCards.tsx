"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, CheckCircle2, Star, ThumbsDown } from "lucide-react";
import type { ReviewsStatsCardsProps } from "../../types";

export const ReviewsStatsCards: React.FC<ReviewsStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Reviews */}
      <Card className="border-border shadow-xs hover:border-border/80 transition-colors">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Reviews
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stats.totalReviews.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <MessageSquare className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Pending Moderation */}
      <Card
        className={`border-border shadow-xs transition-colors ${
          stats.pendingCount > 0
            ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10"
            : ""
        }`}
      >
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pending Moderation
              </p>
              {stats.pendingCount > 0 && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 text-[10px] px-1.5 py-0 font-semibold animate-pulse"
                >
                  Action Needed
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stats.pendingCount.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Approved Reviews */}
      <Card className="border-border shadow-xs hover:border-border/80 transition-colors">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Approved Reviews
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stats.approvedCount.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                ({stats.totalReviews > 0 ? Math.round((stats.approvedCount / stats.totalReviews) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Platform Average Rating */}
      <Card className="border-border shadow-xs hover:border-border/80 transition-colors">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Average Rating
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stats.averageRating ? Number(stats.averageRating).toFixed(1) : "0.0"}
              </span>
              <div className="flex items-center text-amber-500">
                <Star className="h-4 w-4 fill-amber-500" />
              </div>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
            <Star className="h-5 w-5 fill-amber-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsStatsCards;

