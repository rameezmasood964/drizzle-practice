import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Server Actions Body Size Limit (Badi files upload karne ke liye)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // 2. External Images Configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Agar Cloudinary use kar rahe hain:
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Tamam HTTPS external image URLs ko allow karne ke liye (Sabse safe option):
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
