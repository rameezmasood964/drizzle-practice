"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface AreaOption {
  id: string;
  name: string;
  count: number;
}

const BAHWALPUR_AREAS: AreaOption[] = [
  { id: "satellite-town", name: "Satellite Town", count: 120 },
  { id: "model-town", name: "Model Town A/B", count: 95 },
  { id: "cantt", name: "Bahawalpur Cantt", count: 60 },
  { id: "farid-gate-circular-rd", name: "Farid Gate & Circular Road", count: 140 },
  { id: "baghdad-ul-jadeed-iub", name: "Baghdad-ul-Jadeed (IUB)", count: 50 },
  { id: "dubai-mahal-road", name: "Dubai Mahal Road", count: 35 },
];

interface AreaFilterProps {
  selectedAreas?: string[];
  onChange?: (selected: string[]) => void;
}

export function AreaFilter({
  selectedAreas = [],
  onChange,
}: AreaFilterProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [internalSelected, setInternalSelected] = React.useState<string[]>(selectedAreas);

  const filteredAreas = React.useMemo(() => {
    if (!searchQuery.trim()) return BAHWALPUR_AREAS;
    return BAHWALPUR_AREAS.filter((area) =>
      area.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [searchQuery]);

  const handleToggle = (id: string) => {
    const next = internalSelected.includes(id)
      ? internalSelected.filter((item) => item !== id)
      : [...internalSelected, id];

    setInternalSelected(next);
    onChange?.(next);
  };

  return (
    <div className="space-y-3">
      {/* Search Input for Areas */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 pl-8 text-xs bg-muted/40"
        />
      </div>

      {/* Checkbox List */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {filteredAreas.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 text-center">
            No areas found
          </p>
        ) : (
          filteredAreas.map((area) => {
            const isChecked = internalSelected.includes(area.id);
            return (
              <label
                key={area.id}
                className="flex items-center justify-between text-xs py-1 px-1 rounded-md cursor-pointer hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => handleToggle(area.id)}
                  />
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    {area.name}
                  </span>
                </div>
                <span className="rounded-full border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {area.count}
                </span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AreaFilter;

