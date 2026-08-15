import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(siteConfig.siteUrl ? { sitemap: `${siteConfig.siteUrl}/sitemap.xml` } : {}),
  };
}

