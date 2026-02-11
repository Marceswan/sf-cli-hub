import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_6ELJtZ1nNWRX@ep-withered-breeze-aiblr8ww.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require",
    AUTH_SECRET: process.env.AUTH_SECRET || "Q5OIgoC6MsSjQnK64fZLnFfNJPOcB1regFYEBDeiPvw2",
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID || "Ov23li09burqa6iB8e0m",
    AUTH_GITHUB_SECRET:
      process.env.AUTH_GITHUB_SECRET || "1aaf2aad6412a4e3fdcb62e57212d2ae3f99a826",
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
