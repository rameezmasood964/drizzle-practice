import type { Metadata } from "next";
import { CategoriesView } from "@/modules/categories/components/public/views/categories_view";

export const metadata: Metadata = {
  title: "All Categories - apnaBwp | Verified Directory of Bahawalpur",
  description:
    "Browse all business categories, hostels, clinics, food, and services in Bahawalpur.",
};

export default function CategoriesPage() {
  return <CategoriesView />;
}

