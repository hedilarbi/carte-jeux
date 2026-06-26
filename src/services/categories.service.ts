import { serializeDocument } from "@/lib/utils/serialization";
import { formatProductPrice } from "@/lib/utils/pricing";
import { listCategories } from "@/repositories/category.repository";
import { listProducts } from "@/repositories/product.repository";
import type { Category, Product } from "@/types/entities";

export interface CategoriesPageCategory {
  description?: string;
  id: string;
  image?: string;
  isPlateforme: boolean;
  label: string;
  slug: string;
  sortOrder: number;
}

export interface CategoriesPageProduct {
  id: string;
  image?: string;
  platformImage?: string;
  platformName: string;
  price: string;
  slug: string;
  title: string;
}

export interface CategoriesPageContent {
  platforms: CategoriesPageCategory[];
  products: CategoriesPageProduct[];
  types: CategoriesPageCategory[];
}

function toPageCategory(category: Category): CategoriesPageCategory {
  return {
    description: category.description,
    id: category._id,
    image: category.image,
    isPlateforme: Boolean(category.isPlateforme),
    label: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder,
  };
}

function resolveProductPlatform(
  product: Product,
  categoryMap: Map<string, Category>,
) {
  return (
    product.categoryIds
      .map((categoryId) => categoryMap.get(categoryId))
      .find((category) => category?.isPlateforme) ??
    categoryMap.get(product.platformId)
  );
}

function toPageProduct(
  product: Product,
  categoryMap: Map<string, Category>,
): CategoriesPageProduct {
  const platform = resolveProductPlatform(product, categoryMap);

  return {
    id: product._id,
    image: product.image,
    platformImage: platform?.image,
    platformName: platform?.name ?? "Global",
    price: formatProductPrice(product.finalPrice),
    slug: product.slug,
    title: product.title,
  };
}

export const categoriesService = {
  async getCategoriesPageContent(): Promise<CategoriesPageContent> {
    const [categoryResult, productResult] = await Promise.all([
      listCategories({
        page: 1,
        limit: 100,
        isActive: true,
      }),
      listProducts({
        page: 1,
        limit: 5,
        isActive: true,
        sort: "popular",
      }),
    ]);
    const categories = serializeDocument<Category[]>(categoryResult.items);
    const products = serializeDocument<Product[]>(productResult.items);
    const categoryMap = new Map(
      categories.map((category) => [category._id, category]),
    );

    return {
      platforms: categories
        .filter((category) => category.isPlateforme)
        .map(toPageCategory),
      products: products.map((product) => toPageProduct(product, categoryMap)),
      types: categories
        .filter((category) => !category.isPlateforme)
        .map(toPageCategory),
    };
  },
};
