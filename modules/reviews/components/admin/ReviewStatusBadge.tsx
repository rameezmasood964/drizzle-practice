"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import type { ReviewStatusBadgeProps } from "../../types";

export const ReviewStatusBadge: React.FC<ReviewStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  switch (status) {
    case "approved":
      return (
        <Badge
          variant="outline"
          className={`inline-flex items-center gap-1 font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 ${className}`}
        >
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span>Approved</span>
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className={`inline-flex items-center gap-1 font-medium bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 ${className}`}
        >
          <Clock className="h-3 w-3 shrink-0" />
          <span>Pending</span>
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className={`inline-flex items-center gap-1 font-medium bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 ${className}`}
        >
          <XCircle className="h-3 w-3 shrink-0" />
          <span>Rejected</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
};

export default ReviewStatusBadge;

