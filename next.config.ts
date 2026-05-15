import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  turbopack: {
    root: '/home/z/my-project',
  },
  allowedDevOrigins: [
    'preview-chat-e8fcbf37-a186-4573-bc66-6203aefaaeb6.space-z.ai',
  ],
};

export default nextConfig;
