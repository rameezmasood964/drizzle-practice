import type { ListingMedia } from "../types";

/**
 * Nayi selected files ko ListingMedia format mein convert karta hai
 * aur pehli image ko automatically cover set karta hai agar pehle se koi na ho.
 */
export const createMediaItemsFromFiles = (
  files: FileList | File[],
  existingImages: ListingMedia[] = []
): ListingMedia[] => {
  const fileArray = Array.from(files);

  const newItems: ListingMedia[] = fileArray.map((file, index) => ({
    id: `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    url: URL.createObjectURL(file), // Browser preview ke liye local blob URL
    isCover: existingImages.length === 0 && index === 0, // Agar pehle se koi image nahi, to pehli image cover hogi
    file: file,
  }));

  return [...existingImages, ...newItems];
};

/**
 * Image remove karta hai.
 * Agar cover image delete ho jaye to agli bachi hui image ko cover bana deta hai.
 */
export const removeMediaItem = (
  idToRemove: string,
  images: ListingMedia[]
): ListingMedia[] => {
  const filtered = images.filter((img) => img.id !== idToRemove);

  // Agar delete hone wali cover thi aur mazeed images bachi hain, to pehli ko cover set karein
  if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
    filtered[0].isCover = true;
  }

  return filtered;
};

/**
 * Specific image ID ko cover mark karta hai aur baqion ko false karta hai.
 */
export const setCoverMediaItem = (
  idToCover: string,
  images: ListingMedia[]
): ListingMedia[] => {
  return images.map((img) => ({
    ...img,
    isCover: img.id === idToCover,
  }));
};