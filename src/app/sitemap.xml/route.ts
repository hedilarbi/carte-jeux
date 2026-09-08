import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProductModel } from "@/models/product.model";

const DOMAIN = "https://playsdepot.com";
const PRODUCTS_PER_SITEMAP = 10000;

export async function GET() {
  await connectToDatabase();
  
  const totalProducts = await ProductModel.countDocuments({
    isActive: true,
    indexable: { $ne: false },
  });

  const sitemapCount = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP));
  const date = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (let i = 0; i < sitemapCount; i++) {
    xml += `
  <sitemap>
    <loc>${DOMAIN}/sitemap/${i}.xml</loc>
    <lastmod>${date}</lastmod>
  </sitemap>`;
  }

  xml += `
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
