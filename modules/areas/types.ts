// Single Area item entity
export interface AreaItem {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date | string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

// Table Component Props
export interface AreasTableProps {
  areas?: AreaItem[];
  isLoading?: boolean;
  pagination?: PaginationInfo;
  searchQuery?: string;
}

// Form Values Structure
export interface AreaFormValues {
  name: string;
  slug?: string;
  isActive: boolean;
}

// AddAreasForm Props
export interface AddAreasFormProps {
  initialData?: AreaItem | null;
  onSuccess?: () => void;
}
export type Area = AreaItem;