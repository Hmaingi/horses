import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable specific ESLint rules during builds
    ignoreDuringBuilds: true, // Set to true to ignore all ESLint errors
    // Note: Fine-grained rule disabling is better handled in .eslintrc.json
  },
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
