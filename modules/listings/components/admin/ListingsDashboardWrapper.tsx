import ListingHeader from "./listingDashboard/listingHeader";
import ListingStats from "./listingDashboard/listingStats";
import ListingFilters from "./listingDashboard/listingFilters";
import ListingsTable from "./listingDashboard/listingsTable";
import { ListingsDashboardWrapperProps } from "../../types";

const ListingsDashboardWrapper = ({
  stats,
  listings = [],
  categories = [],
}: ListingsDashboardWrapperProps) => {
  return (
    <div>
      <div className="space-y-6">
        <ListingHeader />
        <ListingStats {...stats} />
        <ListingFilters categories={categories} />
        <ListingsTable listings={listings} />
      </div>
    </div>
  );
};

export default ListingsDashboardWrapper;
