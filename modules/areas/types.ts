// Single Area item entity
export interface AreaItem {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date | string;
}

// Table Component Props
export interface AreasTableProps {
  areas?: AreaItem[];
  isLoading?: boolean;
}

// Form Values Structure
export interface AreaFormValues {
  name: string;
  slug: string;
  isActive: boolean;
}

// AddAreasForm Props
export interface AddAreasFormProps {
  initialData?: AreaItem | null;
  onSuccess?: () => void;
}
export type Area = AreaItem;