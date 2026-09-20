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
      process.env.NEXT_PUBLIC_APP_URL || "https://sfdxhub.com",
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "true",
  },
  async rewrites() {
    return [
      { source: "/_s/a.js", destination: "https://stats.atrop-os.com/script.js" },
      { source: "/_s/api/send", destination: "https://stats.atrop-os.com/api/send" },
      { source: "/_s/api/hit", destination: "https://stats.atrop-os.com/api/send" },
    ];
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
