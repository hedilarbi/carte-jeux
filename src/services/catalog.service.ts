import { serializeDocument } from "@/lib/utils/serialization";
import { listCategories } from "@/repositories/category.repository";
import { listProducts } from "@/repositories/product.repository";
import { listAllRegions } from "@/repositories/region.repository";
import type { Category, Product, Region } from "@/types/entities";
import type {
  CatalogCategoryFilter,
  CatalogPageContent,
  CatalogProduct,
  CatalogRegionFilter,
  CatalogSelectedFilters,
} from "@/types/catalog";

interface CatalogQueryInput {
  max?: string;
  min?: string;
  q?: string;
  region?: string;
  search?: string;
  sort?: string;
}

function normalizeQueryValue(value?: string) {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function normalizeSort(value?: string): string {
  return ["popular", "price-asc", "price-desc", "new"].includes(value ?? "")
    ? (value as string)
    : "popular";
}

function formatCatalogPrice(value: number) {
  return value.toFixed(3);
}

function toCategoryFilter(category: Category): CatalogCategoryFilter {
  return {
    id: category._id,
    image: category.image,
    isPlateforme: Boolean(category.isPlateforme),
    label: category.name,
    slug: category.slug,
  };
}

function toRegionFilter(region: Region): CatalogRegionFilter {
  return {
    code: region.code.toLowerCase(),
    id: region._id,
    label: region.name,
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

function toCatalogProduct(
  product: Product,
  categoryMap: Map<string, Category>,
  regionMap: Map<string, Region>,
): CatalogProduct {
  const platform = resolveProductPlatform(product, categoryMap);
  const region =
    (product.regionId ? regionMap.get(product.regionId) : undefined) ??
    product.regionIds.map((regionId) => regionMap.get(regionId)).find(Boolean);
  const originalPrice =
    product.discountPercent > 0 && product.price > product.finalPrice
      ? formatCatalogPrice(product.price)
      : undefined;

  return {
    id: product._id,
    image: product.image,
    originalPrice,
    platform: platform?.name ?? "Global",
    platformImage: platform?.image,
    platformSlug: platform?.slug,
    price: formatCatalogPrice(product.finalPrice),
    region: region?.name ?? "Global",
    slug: product.slug,
    title: product.title,
  };
}

export const catalogService = {
  async getProductsPageContent(
    input: CatalogQueryInput,
  ): Promise<CatalogPageContent> {
    const selected: CatalogSelectedFilters = {
      max: normalizeQueryValue(input.max),
      min: normalizeQueryValue(input.min),
      q: normalizeQueryValue(input.q),
      region: normalizeQueryValue(input.region)?.toLowerCase(),
      search: normalizeQueryValue(input.search),
      sort: normalizeSort(input.sort),
    };

    const [categoryResult, regions] = await Promise.all([
      listCategories({
        page: 1,
        limit: 100,
        isActive: true,
      }),
      listAllRegions(),
    ]);

    const categories = serializeDocument<Category[]>(categoryResult.items);
    const activeRegions = serializeDocument<Region[]>(regions);
    const categoryMap = new Map(
      categories.map((category) => [category._id, category]),
    );
    const categoryBySlug = new Map(
      categories.map((category) => [category.slug, category]),
    );
    const regionMap = new Map(
      activeRegions.map((region) => [region._id, region]),
    );
    const regionByCode = new Map(
      activeRegions.map((region) => [region.code.toLowerCase(), region]),
    );
    const activeCategory = selected.q
      ? categoryBySlug.get(selected.q)
      : undefined;
    const activeRegion = selected.region
      ? regionByCode.get(selected.region)
      : undefined;
    const productResult = await listProducts({
      page: 1,
      limit: 60,
      isActive: true,
      search: selected.search,
      categoryId:
        activeCategory && !activeCategory.isPlateforme
          ? activeCategory._id
          : undefined,
      platformId:
        activeCategory?.isPlateforme ? activeCategory._id : undefined,
      regionId: activeRegion?._id,
      priceMin: selected.min,
      priceMax: selected.max,
      sort: selected.sort,
    });
    const products = serializeDocument<Product[]>(productResult.items);

    return {
      activeCategory: activeCategory
        ? toCategoryFilter(activeCategory)
        : undefined,
      filters: {
        platforms: categories
          .filter((category) => category.isPlateforme)
          .map(toCategoryFilter),
        regions: activeRegions.map(toRegionFilter),
        types: categories
          .filter((category) => !category.isPlateforme)
          .map(toCategoryFilter),
      },
      products: products.map((product) =>
        toCatalogProduct(product, categoryMap, regionMap),
      ),
      selected,
      totalItems: productResult.totalItems,
    };
  },
};
