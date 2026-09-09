import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "MJ12bot",
          "DotBot",
          "BLEXBot",
          "DataForSeoBot",
          "MegaIndex",
          "serpstatbot",
        ],
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: "https://playsdepot.com/sitemap.xml",
  };
}
