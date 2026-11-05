import React from "react";
import ReviewViewWrapper from "@/modules/reviews/views/review_view_wrapper";
import {
  getAdminReviews,
  getAdminReviewStats,
} from "@/modules/reviews/queries";
import { getCategoriesWithSubcategories } from "@/modules/categories/queries";

export const metadata = {
  title: "Reviews Moderation | Admin Panel",
  description: "Moderate and manage customer reviews, ratings, and business replies.",
};

export default async function AdminReviewsPage() {
  const [reviews, stats, categories] = await Promise.all([
    getAdminReviews(),
    getAdminReviewStats(),
    getCategoriesWithSubcategories().catch(() => []),
  ]);

  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <ReviewViewWrapper
        initialReviews={reviews}
        stats={stats}
        categories={categories && categories.length > 0 ? categories : undefined}
      />
    </div>
  );
}
