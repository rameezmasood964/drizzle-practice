"use client";

import { useRef } from "react";
import { UploadCloud, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingFormValues, ListingMedia } from "@/modules/listings/types";

// 1. Utils se functions import karein
import {
  createMediaItemsFromFiles,
  removeMediaItem,
  setCoverMediaItem,
} from "@/modules/listings/utils/media_utils";

const MediaSection = () => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ListingFormValues>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const images = (watch("images") || []) as ListingMedia[];

  // 2. Simple clean handlers jo utils ko call karte hain
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Util call
    const updatedImages = createMediaItemsFromFiles(files, images);
    setValue("images", updatedImages, { shouldValidate: true });

    // Input reset
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (id: string) => {
    // Util call
    const updatedImages = removeMediaItem(id, images);
    setValue("images", updatedImages, { shouldValidate: true });
  };

  const handleSetCover = (id: string) => {
    // Util call
    const updatedImages = setCoverMediaItem(id, images);
    setValue("images", updatedImages, { shouldValidate: true });
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ImageIcon className="h-4 w-4 text-primary" />
          Images <span className="text-destructive">*</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Dropzone Trigger */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-6 text-center transition hover:bg-muted/40 cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            Click to browse or upload images
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, WEBP (Min 1 image required)
          </p>
        </div>

        {/* Actual error ko theek se print karne ke liye */}
        {errors.images && (
          <p className="text-xs text-destructive">
            {/* 1. Root / Min array error */}
            {errors.images.root?.message ||
              (typeof errors.images.message === "string"
                ? errors.images.message
                : null) ||
              /* 2. Agar array ke pehle item mein file size/format ka error ho */
              (Array.isArray(errors.images) &&
                ((errors.images[0]?.file?.message as string) ||
                  (errors.images[0]?.url?.message as string))) ||
              "Kam az kam 1 valid image upload karein"}
          </p>
        )}

        {/* Preview List */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2">
            {images.map((image) => (
              <div
                key={image.id}
                className={`group relative h-24 w-32 overflow-hidden rounded-md border bg-muted transition ${
                  image.isCover
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border"
                }`}
              >
                <Image
                  src={image.url}
                  alt="Listing preview"
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 128px"
                />

                {image.isCover ? (
                  <div className="absolute left-1.5 top-1.5 z-10">
                    <Badge className="bg-primary text-[10px] text-primary-foreground font-medium px-1.5 py-0 shadow-sm">
                      Cover
                    </Badge>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetCover(image.id)}
                    className="absolute left-1.5 top-1.5 z-10 hidden rounded bg-black/60 px-1 py-0.5 text-[9px] text-white opacity-0 transition group-hover:block group-hover:opacity-100 hover:bg-black"
                  >
                    Set Cover
                  </button>
                )}

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemove(image.id)}
                  className="absolute right-1.5 top-1.5 h-6 w-6 rounded-full opacity-90 transition hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaSection;
