import { serializeDocument } from "@/lib/utils/serialization";
import { formatProductPrice } from "@/lib/utils/pricing";
import {
  listCategories,
  listCategoriesBySlugs,
} from "@/repositories/category.repository";
import { listActiveProductsByCategoryOrPlatformId } from "@/repositories/product.repository";
import { listAllRegions } from "@/repositories/region.repository";
import { bestSellerService } from "@/services/best-seller.service";
import type { Category, Product, Region } from "@/types/entities";
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
  regionMap: Map<string, Region>,
): ProductPreview {
  const platformFromCategories = product.categoryIds
    .map((categoryId) => categoryMap.get(categoryId))
    .find((category) => category?.isPlateforme);
  const platform = platformFromCategories ?? categoryMap.get(product.platformId);
  const region =
    (product.regionId ? regionMap.get(product.regionId) : undefined) ??
    product.regionIds.map((regionId) => regionMap.get(regionId)).find(Boolean);
  const originalPrice =
    product.discountPercent > 0 && product.price > product.finalPrice
      ? formatProductPrice(product.price)
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
    price: formatProductPrice(product.finalPrice),
    originalPrice,
    currency: product.currency,
    image: product.image,
    platformImage: platform?.image,
    platformSlug: platform?.slug,
    region: region?.name ?? "Global",
    icon: resolveIcon(platform?.name ?? product.title),
    gradient: "from-[#1b2838] to-[#2a475e]",
    badges,
    reviews: "0",
  };
}

export const homeService = {
  async getHomePageContent(): Promise<HomePageContent> {
    const [
      categoryResult,
      requestedCategories,
      regionDocuments,
      bestSellerItems,
    ] = await Promise.all([
      listCategories({
        page: 1,
        limit: 100,
        isActive: true,
      }),
      listCategoriesBySlugs(
        HOME_PRODUCT_SECTIONS.map((section) => section.categorySlug),
      ),
      listAllRegions(),
      bestSellerService.list({ activeOnly: true }),
    ]);

    const categories = serializeDocument<Category[]>(categoryResult.items);
    const regions = serializeDocument<Region[]>(regionDocuments);
    const categoryMap = new Map(
      categories.map((category) => [category._id, category]),
    );
    const regionMap = new Map(regions.map((region) => [region._id, region]));
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
            toProductPreview(product, categoryMap, regionMap),
          ),
        };
      }),
    );

    return {
      bestSellers: bestSellerItems
        .map((item) => item.product)
        .filter((product): product is Product => Boolean(product))
        .map((product) => toProductPreview(product, categoryMap, regionMap)),
      categories: categories.map(toHomeCategory),
      productSections,
    };
  },
};
