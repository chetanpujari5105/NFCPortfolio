import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80],
    // Substack post images for the Blog app
    remotePatterns: [
      { protocol: "https", hostname: "substackcdn.com", pathname: "/**" },
      { protocol: "https", hostname: "substack-post-media.s3.amazonaws.com", pathname: "/**" },
      // Latest YouTube video thumbnail (Home page 2)
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },
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
