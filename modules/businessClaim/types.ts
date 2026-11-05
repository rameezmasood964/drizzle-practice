export type ClaimStatus = "pending" | "approved" | "rejected";

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

export interface ClaimItem {
  id: number;
  listingId: number;
  listingTitle: string;
  listingSlug?: string;
  categoryName?: string;
  userId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  claimantRole: string;
  proofDocumentUrl?: string | null;
  notes?: string | null;
  status: ClaimStatus;
  rejectionReason?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | Date | null;
  createdAt: string | Date;
}

export interface ClaimStats {
  totalClaims: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export interface ClaimFilters {
  status: "all" | ClaimStatus;
  search: string;
  category?: string; // e.g. "all", "parent-2", "sub-12"
}

export interface ClaimStatusBadgeProps {
  status: ClaimStatus;
  className?: string;
}

export interface ClaimsStatsCardsProps {
  stats: ClaimStats;
}

export interface ClaimsFilterBarProps {
  filters: ClaimFilters;
  onFilterChange: (filters: ClaimFilters) => void;
  categories?: ParentCategoryOption[];
  pendingCount?: number;
}

export interface ClaimsTableProps {
  claims: ClaimItem[];
  selectedIds: number[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: number, checked: boolean) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (claim: ClaimItem) => void;
  onApproveClick: (claim: ClaimItem) => void;
  onRejectClick: (claim: ClaimItem) => void;
  onDeleteClick?: (claim: ClaimItem) => void;
}

export interface ClaimDetailModalProps {
  claim: ClaimItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveClick: (claim: ClaimItem) => void;
  onRejectClick: (claim: ClaimItem) => void;
}

export interface ApproveClaimDialogProps {
  claim: ClaimItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (claimId: number) => void;
  isSubmitting?: boolean;
}

export interface RejectClaimModalProps {
  claim: ClaimItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (claimId: number, reason: string) => void;
  isSubmitting?: boolean;
}

export interface ClaimViewWrapperProps {
  initialClaims?: ClaimItem[];
  initialStats?: ClaimStats;
  stats?: ClaimStats;
  categories?: ParentCategoryOption[];
}
