import AreasTable from "@/modules/areas/components/admin/AreasTable";
import { getAdminAreas } from "@/modules/areas/queries";
import { MapPin } from "lucide-react";

export default async function AreasAdminPage() {
  const { data: areasList } = await getAdminAreas();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Areas Management
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Bahawalpur ke authorized areas, towns aur mohalle manage karein.
        </p>
      </div>

      <AreasTable areas={areasList || []} />
    </div>
  );
}
