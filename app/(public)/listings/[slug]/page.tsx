import type { Metadata } from "next";
import { ListingDetailViewWrapper } from "@/modules/listings/components/public/views/listing_detail_view_wrapper";

interface ListingDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ListingDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${formattedTitle} - Bahawalpur | apnaBwp`,
    description: `View contact number, location, facilities, and verified reviews for ${formattedTitle} in Bahawalpur.`,
  };
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  await params;
  return <ListingDetailViewWrapper />;
}

