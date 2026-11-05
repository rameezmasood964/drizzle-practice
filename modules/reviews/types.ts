export type ReviewStatus = "pending" | "approved" | "rejected";

export interface SubCategoryOption {
  id: number | string;
  name: string;
  slug: string;
}

export interface ParentCategoryOption {
  id: number | string;
  name: string;
  slug: string;
  subCategories?: SubCategoryOption[];
}

export interface ReviewItem {
  id: number;
  listingId: number;
  listingTitle: string;
  listingCategory?: string;
  categoryId?: number;
  subCategoryId?: number | null;
  parentCategoryId?: number | null;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  status: ReviewStatus;
  rejectionReason?: string | null;
  ownerReply?: string | null;
  ownerRepliedAt?: string | Date | null;
  createdAt: string | Date;
}

export interface ReviewStats {
  totalReviews: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  averageRating: number;
}

export interface ReviewFilters {
  status?: ReviewStatus | "all";
  rating?: number | "all";
  search?: string;
  categoryId?: string; // e.g. "all", "parent-2", "sub-12"
}

export interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  className?: string;
}

export interface ReviewsStatsCardsProps {
  stats: ReviewStats;
}

export interface ReviewsFilterBarProps {
  filters: ReviewFilters;
  onFilterChange: (filters: ReviewFilters) => void;
  categories?: ParentCategoryOption[];
  pendingCount?: number;
}

export interface ReviewDetailModalProps {
  review: ReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onRejectClick: (review: ReviewItem) => void;
  onReplyClick: (review: ReviewItem) => void;
}

export interface RejectReasonModalProps {
  review: ReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, reason: string) => void;
  isSubmitting?: boolean;
}

export interface OwnerReplyModalProps {
  review: ReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, reply: string) => void;
  isSubmitting?: boolean;
}

export interface ReviewsTableProps {
  reviews: ReviewItem[];
  selectedIds?: number[];
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (id: number, checked: boolean) => void;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onApprove: (id: number) => void;
  onRejectClick: (review: ReviewItem) => void;
  onReplyClick: (review: ReviewItem) => void;
  onViewDetail: (review: ReviewItem) => void;
  onDelete?: (id: number) => void;
}

export interface ReviewViewWrapperProps {
  initialReviews?: ReviewItem[];
  stats?: ReviewStats;
  categories?: ParentCategoryOption[];
}
