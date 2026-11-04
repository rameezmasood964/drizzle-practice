import * as React from "react";
import { ListingHeaderInfo } from "../details/listing_header_info";
import { ListingGalleryBanner } from "../details/listing_gallery_banner";
import { ListingAboutSection } from "../details/listing_about_section";
import { ListingAmenitiesList } from "../details/listing_amenities_list";
import { ListingLocationCard } from "../details/listing_location_card";
import { ListingReviewsSummary, type ReviewItem } from "../details/listing_reviews_summary";
import { ListingContactSidebar } from "../listing_contact_sidebar";
import { ListingMobileStickyBar } from "../listing_mobile_sticky_bar";

export interface ListingDetailData {
  id: string;
  slug: string;
  title: string;
  category: string;
  area: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  price: string;
  managerName: string;
  phone: string;
  whatsapp: string;
  timings: string;
  images: string[];
  description: string;
  amenities: Record<string, boolean | string>;
  fullAddress: string;
  landmark: string;
  mapUrl: string;
  reviews: ReviewItem[];
}

export const MOCK_HOSTEL_DETAIL: ListingDetailData = {
  id: "1",
  slug: "al-madina-boys-hostel",
  title: "Al-Madina Boys Hostel",
  category: "Hostels & Living",
  area: "Satellite Town",
  rating: 4.8,
  reviewCount: 34,
  isOpen: true,
  price: "Rs. 9,500/mo",
  managerName: "Malik Usman (Hostel Warden)",
  phone: "+923001234567",
  whatsapp: "923001234567",
  timings: "Visiting Hours: 9:00 AM - 9:00 PM (Daily)",
  images: [
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  ],
  description:
    "Al-Madina Boys Hostel is one of the most reputable and secure student residences located in the heart of Satellite Town, Bahawalpur. Situated just 5 minutes away from major coaching academies and 15 minutes from Baghdad-ul-Jadeed Campus (IUB).\n\nWe provide neat, clean, and well-ventilated rooms with round-the-clock security, uninterrupted solar generator power backup, high-speed fiber internet, and hygienic three-time mess facility managed by experienced staff.",
  amenities: {
    roomType: "2 & 3 Seater",
    messFacility: "3-Times Daily",
    powerBackup: "Solar & Generator",
    internet: "100 Mbps WiFi",
    airConditioned: true,
    attachedWashroom: true,
    filteredWaterPlant: true,
    laundryFacility: true,
    securityGuards: true,
    smokingAllowed: false,
  },
  fullAddress: "Street 4, Sector B, Near Commercial Market, Satellite Town, Bahawalpur",
  landmark: "Near Al-Razi Hospital & IUB Shuttle Stop",
  mapUrl: "https://maps.google.com/?q=Satellite+Town+Bahawalpur",
  reviews: [
    {
      id: "r1",
      author: "Hamza Tariq",
      rating: 5,
      date: "1 week ago",
      comment:
        "Bohut acha hostel hai. Khana bohut hygienic aur waqt par milta hai. IUB students ke liye location perfect hai.",
    },
    {
      id: "r2",
      author: "Saad Rafique",
      rating: 5,
      date: "3 weeks ago",
      comment:
        "Load shedding ka koi issue nahi, solar system zabardast kaam karta hai. WiFi speed is also consistently good.",
    },
    {
      id: "r3",
      author: "Ahsan Bilal",
      rating: 4,
      date: "1 month ago",
      comment:
        "Overall great experience. Rooms are spacious and the warden is very cooperative.",
    },
  ],
};

export interface ListingDetailViewWrapperProps {
  initialData?: ListingDetailData;
}

export function ListingDetailViewWrapper({
  initialData = MOCK_HOSTEL_DETAIL,
}: ListingDetailViewWrapperProps) {
  const listing = initialData;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-12">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
        {/* Header Breadcrumbs & Title */}
        <ListingHeaderInfo
          title={listing.title}
          category={listing.category}
          area={listing.area}
          rating={listing.rating}
          reviewCount={listing.reviewCount}
        />

        {/* Gallery Banner */}
        <ListingGalleryBanner
          images={listing.images}
          title={listing.title}
          isOpen={listing.isOpen}
        />

        {/* Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Details, Features, Location, Reviews */}
          <main className="space-y-8 lg:col-span-2">
            <ListingAboutSection
              description={listing.description}
              timings={listing.timings}
              category={listing.category}
            />

            <ListingAmenitiesList amenities={listing.amenities} />

            <ListingLocationCard
              fullAddress={listing.fullAddress}
              landmark={listing.landmark}
              mapUrl={listing.mapUrl}
            />

            <ListingReviewsSummary
              rating={listing.rating}
              reviewCount={listing.reviewCount}
              reviews={listing.reviews}
            />
          </main>

          {/* Right Column: Sticky Contact Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <ListingContactSidebar
              price={listing.price}
              managerName={listing.managerName}
              phone={listing.phone}
              whatsapp={listing.whatsapp}
              timings={listing.timings}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sticky Bar (Visible on mobile only) */}
      <ListingMobileStickyBar
        phone={listing.phone}
        whatsapp={listing.whatsapp}
      />
    </div>
  );
}

export default ListingDetailViewWrapper;

