import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProductModel } from "@/models/product.model";
import { CategoryModel } from "@/models/category.model";

const DOMAIN = "https://playsdepot.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectToDatabase();

  const [products, categories] = await Promise.all([
    ProductModel.find(
      { isActive: true, indexable: true },
      { slug: 1, updatedAt: 1 }
    ).lean(),
    CategoryModel.find(
      { isActive: true, indexable: true },
      { slug: 1, isPlateforme: 1, updatedAt: 1 }
    ).lean(),
  ]);

  return [
    { url: `${DOMAIN}/`, lastModified: new Date(), priority: 1 },
    { url: `${DOMAIN}/produits`, lastModified: new Date(), priority: 0.9 },
    { url: `${DOMAIN}/categories`, lastModified: new Date(), priority: 0.8 },
    ...categories.map((category) => ({
      url: `${DOMAIN}/categories/${category.isPlateforme ? "plateformes" : "types"}/${category.slug}/`,
      lastModified: category.updatedAt,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${DOMAIN}/produits/${product.slug}`,
      lastModified: product.updatedAt,
      priority: 0.7,
    })),
  ];
}
