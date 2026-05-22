import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  outputFileTracingRoot: __dirname,
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
