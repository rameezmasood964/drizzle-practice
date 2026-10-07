import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👈 Yeh configuration add karni hai
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Aap yahan 5mb ya 10mb apni marzi se rakh sakte hain
    },
  },
};

export default nextConfig; 