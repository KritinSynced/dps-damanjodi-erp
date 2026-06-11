import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Disabled for Clerk auth compatibility (requires server actions & middleware)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

