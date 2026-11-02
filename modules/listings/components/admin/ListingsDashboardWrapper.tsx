import ListingHeader from "./listingDashboard/listingHeader";
import ListingStats from "./listingDashboard/listingStats";
import ListingFilters from "./listingDashboard/listingFilters";
import ListingsTable from "./listingDashboard/listingsTable";
import { ListingsDashboardWrapperProps } from "../../types";

interface ExtendedWrapperProps extends ListingsDashboardWrapperProps {
  areas?: { id: number | string; name: string }[];
}

const ListingsDashboardWrapper = ({
  stats,
  listings = [],
  categories = [],
  areas = [], // 👈 areas receive karein
  pagination,
}: ExtendedWrapperProps) => {
  return (
    <div className="space-y-6">
      <ListingHeader />
      <ListingStats {...stats} />
      <ListingFilters categories={categories} areas={areas} />{" "}
      {/* 👈 areas pass karein */}
      <ListingsTable listings={listings} pagination={pagination} />
    </div>
  );
};

export default ListingsDashboardWrapper;
