import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days image caching
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
      {
        protocol: "http",
        hostname: "*",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "react-icons/fa6",
      "react-icons/fa",
      "react-icons/ai",
      "react-icons/io5",
      "react-icons/bs",
      "react-icons/sl",
      "react-icons/tb",
      "react-icons/tfi",
      "react-icons/ri",
      "react-icons/lu",
      "react-icons/gr",
      "react-icons/fi",
      "chart.js",
      "leaflet",
      "react-leaflet",
      "@tiptap/react",
      "@tiptap/pm",
      "@tiptap/starter-kit",
      "clsx",
    ],
  },
  allowedDevOrigins: ["http://localhost:3000", "http://192.168.1.26:3000"],
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/home",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;