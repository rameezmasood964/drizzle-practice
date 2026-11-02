"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export interface UploadImagesResult {
  success: boolean;
  message?: string;
  urls: string[];
}

/**
 * Server action jo FormData se files receive karta hai
 * aur unhe Supabase ke 'listings' bucket par upload karke
 * unka permanent public URL return karta hai.
 */
export async function uploadListingImagesAction(
  formData: FormData,
): Promise<UploadImagesResult> {
  try {
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return {
        success: false,
        message: "Upload ke liye koi file nahi mili.",
        urls: [],
      };
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
        continue;
      }

      // Safe unique filename create karein
      const fileExt = file.name.split(".").pop() || "jpg";
      const cleanBaseName = file.name
        .substring(0, file.name.lastIndexOf(".") || file.name.length)
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();

      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${cleanBaseName}.${fileExt}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("listings")
        .upload(uniqueFileName, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error("SUPABASE_STORAGE_UPLOAD_ERROR:", uploadError);
        return {
          success: false,
          message: `Image upload fail ho gayi: ${uploadError.message}`,
          urls: [],
        };
      }

      // Permanent Public URL generate karein
      const { data: publicUrlData } = supabase.storage
        .from("listings")
        .getPublicUrl(uniqueFileName);

      uploadedUrls.push(publicUrlData.publicUrl);
    }

    return {
      success: true,
      urls: uploadedUrls,
    };
  } catch (error: any) {
    console.error("UPLOAD_LISTING_IMAGES_EXCEPTION:", error);
    return {
      success: false,
      message: error?.message || "Images upload karte waqt server error aaya.",
      urls: [],
    };
  }
}
