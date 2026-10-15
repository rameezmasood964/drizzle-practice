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