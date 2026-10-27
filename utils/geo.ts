
// utils/geo.ts
// Bahawalpur ki red line se har taraf taqreeban 5 km extra

export const BWP_BOUNDS = {
  minLat: 29.26,
  maxLat: 29.49,
  minLng: 71.55,
  maxLng: 71.83,
};

// Map shuru mein shehar ke darmiyan par khulega
export const BWP_CENTER = { lat: 29.39, lng: 71.68 };

// Kya yeh lat/lng Bahawalpur ki hudood ke andar hain?
export function isInBounds(lat: number, lng: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

  return (
    lat >= BWP_BOUNDS.minLat &&
    lat <= BWP_BOUNDS.maxLat &&
    lng >= BWP_BOUNDS.minLng &&
    lng <= BWP_BOUNDS.maxLng
  );
}