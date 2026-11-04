"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface FacilityOption {
  id: string;
  label: string;
}

const CATEGORY_FACILITIES_MAP: Record<string, FacilityOption[]> = {
  "hostels-accommodation": [
    { id: "boys-hostel", label: "Boys Hostel" },
    { id: "girls-hostel", label: "Girls Hostel" },
    { id: "ac-rooms", label: "AC / Air Conditioned" },
    { id: "mess-included", label: "3-Time Mess Included" },
    { id: "ups-generator", label: "Generator / Solar Backup" },
    { id: "wifi-included", label: "High-Speed WiFi" },
  ],
  "food-cafes": [
    { id: "dine-in", label: "Dine-In Available" },
    { id: "takeaway", label: "Takeaway" },
    { id: "family-hall", label: "Family Hall / Privacy" },
    { id: "home-delivery", label: "Home Delivery" },
    { id: "outdoor-seating", label: "Outdoor / Rooftop Seating" },
  ],
  "doctors-clinics": [
    { id: "specialist", label: "Specialist Consultant" },
    { id: "lab-available", label: "Diagnostic Lab on-site" },
    { id: "pharmacy", label: "24/7 Pharmacy" },
    { id: "emergency", label: "Emergency Services" },
  ],
  "default": [
    { id: "car-parking", label: "Car Parking Available" },
    { id: "card-payment", label: "Card / Online Payment" },
    { id: "air-conditioned", label: "Air Conditioned" },
    { id: "wifi", label: "Free WiFi" },
  ],
};

interface DynamicCategoryFilterProps {
  categorySlug?: string;
  selectedFacilities?: string[];
  onChange?: (facilities: string[]) => void;
}

export function DynamicCategoryFilter({
  categorySlug = "hostels-accommodation",
  selectedFacilities = [],
  onChange,
}: DynamicCategoryFilterProps) {
  const [internalSelected, setInternalSelected] = React.useState<string[]>(selectedFacilities);

  const facilities = React.useMemo(() => {
    return CATEGORY_FACILITIES_MAP[categorySlug] || CATEGORY_FACILITIES_MAP["default"];
  }, [categorySlug]);

  const handleToggle = (id: string) => {
    const next = internalSelected.includes(id)
      ? internalSelected.filter((item) => item !== id)
      : [...internalSelected, id];

    setInternalSelected(next);
    onChange?.(next);
  };

  return (
    <div className="space-y-2">
      {facilities.map((facility) => {
        const isChecked = internalSelected.includes(facility.id);
        return (
          <label
            key={facility.id}
            className="flex items-center justify-between text-xs py-1 px-1 rounded-md cursor-pointer hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => handleToggle(facility.id)}
              />
              <span className="text-foreground group-hover:text-primary transition-colors">
                {facility.label}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}

export default DynamicCategoryFilter;

