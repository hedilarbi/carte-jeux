import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProductModel } from "@/models/product.model";
import { CategoryModel } from "@/models/category.model";

const DOMAIN = "https://playsdepot.com";
const PRODUCTS_PER_SITEMAP = 10000;

export const dynamicParams = false;

export async function generateStaticParams() {
  await connectToDatabase();
  const totalProducts = await ProductModel.countDocuments({
    isActive: true,
    indexable: { $ne: false },
  });
  const sitemapCount = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP));
  return Array.from({ length: sitemapCount }, (_, i) => ({
    id: `${i}.xml`,
  }));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectToDatabase();
  
  // Extract number from id (e.g., "0.xml" -> 0)
  const idStr = id.replace(".xml", "");
  const sitemapId = parseInt(idStr, 10);
  
  if (isNaN(sitemapId) || sitemapId < 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Include static routes and categories ONLY in the first sitemap chunk
  if (sitemapId === 0) {
    xml += `
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/produits</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${DOMAIN}/categories</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`;

    const categories = await CategoryModel.find(
      { isActive: true, indexable: { $ne: false } },
      { slug: 1, isPlateforme: 1, updatedAt: 1 }
    ).lean();

    for (const category of categories) {
      xml += `
  <url>
    <loc>${DOMAIN}/categories/${category.isPlateforme ? "plateformes" : "types"}/${category.slug}/</loc>
    <lastmod>${category.updatedAt.toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`;
    }
  }

  // Fetch the specific chunk of products for the given sitemapId
  const products = await ProductModel.find(
    { isActive: true, indexable: { $ne: false } },
    { slug: 1, updatedAt: 1 }
  )
    .sort({ _id: 1 })
    .skip(sitemapId * PRODUCTS_PER_SITEMAP)
    .limit(PRODUCTS_PER_SITEMAP)
    .lean();

  for (const product of products) {
    xml += `
  <url>
    <loc>${DOMAIN}/produits/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <priority>0.7</priority>
  </url>`;
  }

  xml += `\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
