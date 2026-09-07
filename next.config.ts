import type { NextConfig } from "next";
import { SITE_URL } from "./src/lib/site-url";

const nextConfig: NextConfig = {
  agentRules: false,
  trailingSlash: false,
  async redirects() {
    return [
      { source: "/alojamiento", destination: "/", permanent: true },
      ...["elvagon.com.ar", "el-vagon.vercel.app"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${SITE_URL}/:path*`,
      permanent: true,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
