import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auth and user data are request-time. Cache Components / PPR will be
  // revisited in Phase 9 once the product routes are stable.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
