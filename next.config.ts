import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      "REDACTED_DATABASE_URL",
    AUTH_SECRET: process.env.AUTH_SECRET || "REDACTED_AUTH_SECRET",
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID || "REDACTED_GITHUB_ID",
    AUTH_GITHUB_SECRET:
      process.env.AUTH_GITHUB_SECRET || "REDACTED_GITHUB_SECRET",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://sf-cli-hub.vercel.app",
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "true",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
