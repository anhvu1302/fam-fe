import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",

  // Disable source maps in production to reduce size
  productionBrowserSourceMaps: false,

  // Optimize images
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
  },

  // Compress output
  compress: true,
};

export default nextConfig;
