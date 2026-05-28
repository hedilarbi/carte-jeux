import { serializeDocument } from "@/lib/utils/serialization";
import {
  listCategories,
  listCategoriesBySlugs,
} from "@/repositories/category.repository";
import { listActiveProductsByCategoryOrPlatformId } from "@/repositories/product.repository";
import type { Category, Product } from "@/types/entities";
import type {
  HomeCategoryPreview,
  HomePageContent,
  HomeProductBadge,
  HomeProductSection,
  HomeProductSectionKey,
  ProductPreview,
} from "@/types/home";

const HOME_PRODUCTS_LIMIT = 8;

const HOME_PRODUCT_SECTIONS: Array<{
  key: HomeProductSectionKey;
  categorySlug: string;
}> = [
  { key: "jeuMobile", categorySlug: "jeu-mobile" },
  { key: "psn", categorySlug: "psn" },
  { key: "xbox", categorySlug: "xbox" },
  { key: "nintendo", categorySlug: "nintendo" },
  { key: "gamingPc", categorySlug: "gaming-pc" },
];

function formatHomePrice(value: number) {
  return value.toFixed(3);
}

function resolveIcon(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("mobile") || normalized.includes("google")) {
    return "Smartphone";
  }

  if (normalized.includes("steam") || normalized.includes("pc")) {
    return "Monitor";
  }

  if (normalized.includes("xbox")) {
    return "Circle";
  }

  if (normalized.includes("apple") || normalized.includes("itunes")) {
    return "Apple";
  }

  return "Gamepad2";
}

function toHomeCategory(category: Category): HomeCategoryPreview {
  return {
    id: category._id,
    label: category.name,
    slug: category.slug,
    image: category.image,
    isPlateforme: Boolean(category.isPlateforme),
    sortOrder: category.sortOrder ?? 0,
  };
}

function toProductPreview(
  product: Product,
  categoryMap: Map<string, Category>,
): ProductPreview {
  const platformFromCategories = product.categoryIds
    .map((categoryId) => categoryMap.get(categoryId))
    .find((category) => category?.isPlateforme);
  const platform = platformFromCategories ?? categoryMap.get(product.platformId);
  const originalPrice =
    product.discountPercent > 0 && product.price > product.finalPrice
      ? formatHomePrice(product.price)
      : undefined;
  const badges: HomeProductBadge[] = ["instant"];

  if (product.isFeatured) {
    badges.push("hot");
  }

  if (originalPrice) {
    badges.push("sale");
  }

  return {
    id: product._id,
    slug: product.slug,
    platform: platform?.name ?? "Global",
    name: product.title,
    price: formatHomePrice(product.finalPrice),
    originalPrice,
    currency: product.currency,
    image: product.image,
    platformImage: platform?.image,
    platformSlug: platform?.slug,
    icon: resolveIcon(platform?.name ?? product.title),
    gradient: "from-[#1b2838] to-[#2a475e]",
    badges,
    reviews: "0",
  };
}

export const homeService = {
  async getHomePageContent(): Promise<HomePageContent> {
    const [categoryResult, requestedCategories] = await Promise.all([
      listCategories({
        page: 1,
        limit: 100,
        isActive: true,
      }),
      listCategoriesBySlugs(
        HOME_PRODUCT_SECTIONS.map((section) => section.categorySlug),
      ),
    ]);

    const categories = serializeDocument<Category[]>(categoryResult.items);
    const categoryMap = new Map(
      categories.map((category) => [category._id, category]),
    );
    const requestedCategoryMap = new Map(
      serializeDocument<Category[]>(requestedCategories).map((category) => [
        category.slug,
        category,
      ]),
    );

    const productSections = await Promise.all(
      HOME_PRODUCT_SECTIONS.map(async (section): Promise<HomeProductSection> => {
        const category = requestedCategoryMap.get(section.categorySlug);

        if (!category) {
          return {
            ...section,
            products: [],
          };
        }

        const products = serializeDocument<Product[]>(
          await listActiveProductsByCategoryOrPlatformId(
            category._id,
            HOME_PRODUCTS_LIMIT,
          ),
        );

        return {
          ...section,
          products: products.map((product) =>
            toProductPreview(product, categoryMap),
          ),
        };
      }),
    );

    return {
      categories: categories.map(toHomeCategory),
      productSections,
    };
  },
};
