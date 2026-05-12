import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Cloudflare deployment: no standalone output needed (opennext handles it)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
