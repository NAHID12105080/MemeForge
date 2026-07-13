import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.us-east-005.backblazeb2.com",
        pathname: "/memeforge-production-uploads/**",
      },
    ],
  },
};

export default nextConfig;
