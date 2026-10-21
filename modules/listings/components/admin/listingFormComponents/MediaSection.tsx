"use client";

import { UploadCloud, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MediaSection = () => {
  // Demo images jo UI par preview dikhane ke liye hain
  const demoImages = [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&auto=format&fit=crop&q=60",
      isCover: true,
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500&auto=format&fit=crop&q=60",
      isCover: false,
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&auto=format&fit=crop&q=60",
      isCover: false,
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      {/* Section Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ImageIcon className="h-4 w-4 text-primary" />
          Images
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload Dropzone */}
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-6 text-center transition hover:bg-muted/40 cursor-pointer">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            Drag and drop images here or click to browse
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, WEBP up to 2MB each
          </p>
        </div>

        {/* Uploaded Previews */}
        <div className="flex flex-wrap gap-3">
          {demoImages.map((image) => (
            <div
              key={image.id}
              className="group relative h-24 w-32 overflow-hidden rounded-md border border-border bg-muted"
            >
              <Image
                src={image.url}
                alt="Listing preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 128px"
              />

              {/* Cover Image Badge */}
              {image.isCover && (
                <div className="absolute left-1.5 top-1.5 z-10">
                  <Badge className="bg-primary text-[10px] text-primary-foreground font-medium px-1.5 py-0">
                    Cover
                  </Badge>
                </div>
              )}

              {/* Remove Button */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1.5 top-1.5 h-6 w-6 rounded-full opacity-90 transition hover:opacity-100"
              >
                <X className="h-3.5 w-3.5 text-white" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaSection;
