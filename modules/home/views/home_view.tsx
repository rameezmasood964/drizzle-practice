import { HeroSection } from "@/modules/home/components/hero_section";
import { CategoriesSection } from "@/modules/home/components/categories_section";
import { FeaturedListingsSection } from "@/modules/home/components/featured_listings_section";
import { PopularAreasSection } from "@/modules/home/components/popular_areas_section";
import { CtaBannerSection } from "@/modules/home/components/cta_banner_section";

export function HomeView() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <CategoriesSection />
      <FeaturedListingsSection />
      <PopularAreasSection />
      <CtaBannerSection />
    </div>
  );
}

export default HomeView;
