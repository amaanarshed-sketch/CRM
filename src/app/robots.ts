import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms", "/contact", "/support"],
      disallow: ["/dashboard", "/leads", "/follow-ups", "/stale", "/reports", "/settings", "/import"]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
