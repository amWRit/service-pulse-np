import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "drive.google.com",
      "drive.usercontent.google.com",
      "images.unsplash.com",
      "lh3.googleusercontent.com",
      "*.supabase.co",
      "*.amazonaws.com",
    ],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.usercontent.google.com" },
    ],
  },
};

export default nextConfig;
