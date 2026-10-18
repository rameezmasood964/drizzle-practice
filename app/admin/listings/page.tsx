import ListingFilters from "@/modules/listings/components/admin/listingFilters";
import ListingHeader from "@/modules/listings/components/admin/listingHeader";
import ListingsTable from "@/modules/listings/components/admin/listingsTable";
import ListingStats from "@/modules/listings/components/admin/listingStats";

const ListingsPage = () => {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <ListingHeader />
      <ListingStats />
      <ListingFilters />
      <ListingsTable />
    </div>
  );
};

export default ListingsPage;
