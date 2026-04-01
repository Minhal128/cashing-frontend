import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 requires explicit turbopack config when webpack config is present.
  turbopack: {},
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
