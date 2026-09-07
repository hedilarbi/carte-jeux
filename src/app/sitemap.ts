import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProductModel } from "@/models/product.model";
import { CategoryModel } from "@/models/category.model";

const DOMAIN = "https://playsdepot.com";
const PRODUCTS_PER_SITEMAP = 10000;

export async function generateSitemaps() {
  await connectToDatabase();
  const totalProducts = await ProductModel.countDocuments({
    isActive: true,
    indexable: { $ne: false },
  });

  const sitemapCount = Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP);
  
  // Create an array of IDs from 0 to (sitemapCount - 1)
  // e.g. if 80,000 products -> 8 chunks -> [{ id: 0 }, ..., { id: 7 }]
  return Array.from({ length: sitemapCount }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  await connectToDatabase();
  // Ensure id is treated as a number (defaults to 0 if not provided)
  const sitemapId = Number(id) || 0;

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Include static routes and categories ONLY in the first sitemap chunk
  if (sitemapId === 0) {
    sitemapEntries.push(
      { url: `${DOMAIN}/`, lastModified: new Date(), priority: 1 },
      { url: `${DOMAIN}/produits`, lastModified: new Date(), priority: 0.9 },
      { url: `${DOMAIN}/categories`, lastModified: new Date(), priority: 0.8 }
    );

    const categories = await CategoryModel.find(
      { isActive: true, indexable: { $ne: false } },
      { slug: 1, isPlateforme: 1, updatedAt: 1 }
    ).lean();

    for (const category of categories) {
      sitemapEntries.push({
        url: `${DOMAIN}/categories/${category.isPlateforme ? "plateformes" : "types"}/${category.slug}/`,
        lastModified: category.updatedAt,
        priority: 0.8,
      });
    }
  }

  // Fetch the specific chunk of products for the given sitemapId
  const products = await ProductModel.find(
    { isActive: true, indexable: { $ne: false } },
    { slug: 1, updatedAt: 1 }
  )
    .sort({ _id: 1 }) // Deterministic sort is required when using skip/limit
    .skip(sitemapId * PRODUCTS_PER_SITEMAP)
    .limit(PRODUCTS_PER_SITEMAP)
    .lean();

  for (const product of products) {
    sitemapEntries.push({
      url: `${DOMAIN}/produits/${product.slug}`,
      lastModified: product.updatedAt,
      priority: 0.7,
    });
  }

  return sitemapEntries;
}
