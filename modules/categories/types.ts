// modules/categories/types.ts

export interface Categories {
  id: number;
  name: string;
  slug: string; // Yahan comma (,) ki jagah semicolon (;) aayega
  parentId: number | null;
  icon: string ;     // 👈 Yahan '| null' lazmi lagana hai!
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: Date;
}

export interface CategoryTableProps {
  categories: Categories[];
}

export interface CategoryFormProps {
  onSuccess?: () => void;
  categories: Categories[];
}

// yeh types hain hmari subcategory ka tree function bnany kilye 
export interface CategoryOption {
  id: number;
  name: string;
  level: number;
}


// Drizzle Schema ke fieldType enum ke mutabiq
export type CategoryFieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "multiselect"
  | "boolean";

// Database category_fields table ka single record
export interface CategoryFieldItem {
  id: number;
  categoryId: number;
  key: string;
  label: string;
  type: CategoryFieldType;
  isRequired: boolean;
  options: string[] | null;
  placeholder?: string | null;
  helpText?: string | null;
  sortOrder: number;
  isFilterable: boolean;
  isActive: boolean;
}

// CategoryFields UI component ke props
export interface CategoryFieldsProps {
  categoryName?: string;
  categoryId: string | number;
  initialFields?: CategoryFieldItem[];
}