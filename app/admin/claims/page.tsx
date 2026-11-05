import React from "react";
import ClaimViewWrapper from "@/modules/businessClaim/views/claim_view_wrapper";
import { getAdminClaims, getClaimStats } from "@/modules/businessClaim/queries";
import { getCategoriesWithSubcategories } from "@/modules/categories/queries";

export const metadata = {
  title: "Business Claim Requests | Admin Panel",
  description:
    "Verify business ownership requests, inspect identity proofs, and manage claimed listings.",
};

export default async function AdminClaimsPage() {
  const [claims, stats, categories] = await Promise.all([
    getAdminClaims(),
    getClaimStats(),
    getCategoriesWithSubcategories().catch(() => []),
  ]);

  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <ClaimViewWrapper
        initialClaims={claims}
        initialStats={stats}
        categories={categories && categories.length > 0 ? categories : undefined}
      />
    </div>
  );
}
