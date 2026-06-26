import { serializeDocument } from "@/lib/utils/serialization";
import { formatProductPrice } from "@/lib/utils/pricing";
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

type CatalogQueryValue = string | string[] | undefined;

interface CatalogQueryInput {
  limit?: CatalogQueryValue;
  max?: CatalogQueryValue;
  min?: CatalogQueryValue;
  page?: CatalogQueryValue;
  platform?: CatalogQueryValue;
  q?: CatalogQueryValue;
  region?: CatalogQueryValue;
  search?: CatalogQueryValue;
  sort?: CatalogQueryValue;
  type?: CatalogQueryValue;
}

function readFirstQueryValue(value?: CatalogQueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeQueryValue(value?: CatalogQueryValue) {
  const normalized = readFirstQueryValue(value)?.trim();

  return normalized ? normalized : undefined;
}

function normalizeQueryList(value?: CatalogQueryValue) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const normalizedValues = values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(normalizedValues));
}

function normalizeSort(value?: CatalogQueryValue): string {
  const sort = normalizeQueryValue(value);

  return ["popular", "price-asc", "price-desc", "new"].includes(sort ?? "")
    ? (sort as string)
    : "popular";
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
      ? formatProductPrice(product.price)
      : undefined;

  return {
    id: product._id,
    image: product.image,
    originalPrice,
    platform: platform?.name ?? "Global",
    platformImage: platform?.image,
    platformSlug: platform?.slug,
    price: formatProductPrice(product.finalPrice),
    region: region?.name ?? "Global",
    slug: product.slug,
    title: product.title,
  };
}

export const catalogService = {
  async getProductsPageContent(
    input: CatalogQueryInput,
  ): Promise<CatalogPageContent> {
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

    const requestedTypeSlugs = new Set(normalizeQueryList(input.type));
    const requestedPlatformSlugs = new Set(normalizeQueryList(input.platform));
    const requestedRegionCodes = new Set(normalizeQueryList(input.region));
    const legacyQueryCategory = categoryBySlug.get(
      normalizeQueryList(input.q)[0] ?? "",
    );

    if (legacyQueryCategory?.isPlateforme) {
      requestedPlatformSlugs.add(legacyQueryCategory.slug);
    } else if (legacyQueryCategory) {
      requestedTypeSlugs.add(legacyQueryCategory.slug);
    }

    const selectedTypeCategories = categories.filter(
      (category) =>
        !category.isPlateforme && requestedTypeSlugs.has(category.slug),
    );
    const selectedPlatformCategories = categories.filter(
      (category) =>
        category.isPlateforme && requestedPlatformSlugs.has(category.slug),
    );
    const selectedRegions = activeRegions.filter((region) =>
      requestedRegionCodes.has(region.code.toLowerCase()),
    );

    const selected: CatalogSelectedFilters = {
      max: normalizeQueryValue(input.max),
      min: normalizeQueryValue(input.min),
      platforms: selectedPlatformCategories.map((category) => category.slug),
      regions: selectedRegions.map((region) => region.code.toLowerCase()),
      search: normalizeQueryValue(input.search),
      sort: normalizeSort(input.sort),
      types: selectedTypeCategories.map((category) => category.slug),
    };
    const activeCategories = [
      ...selectedPlatformCategories,
      ...selectedTypeCategories,
    ];
    let productResult = await listProducts({
      page: normalizeQueryValue(input.page),
      limit: normalizeQueryValue(input.limit),
      isActive: true,
      search: selected.search,
      categoryIds: selectedTypeCategories.map((category) => category._id),
      platformIds: selectedPlatformCategories.map((category) => category._id),
      regionIds: selectedRegions.map((region) => region._id),
      priceMin: selected.min,
      priceMax: selected.max,
      sort: selected.sort,
    });

    const totalPages = Math.max(
      1,
      Math.ceil(productResult.totalItems / productResult.limit),
    );

    if (productResult.page > totalPages) {
      productResult = await listProducts({
        page: totalPages,
        limit: productResult.limit,
        isActive: true,
        search: selected.search,
        categoryIds: selectedTypeCategories.map((category) => category._id),
        platformIds: selectedPlatformCategories.map((category) => category._id),
        regionIds: selectedRegions.map((region) => region._id),
        priceMin: selected.min,
        priceMax: selected.max,
        sort: selected.sort,
      });
    }

    const products = serializeDocument<Product[]>(productResult.items);

    return {
      activeCategory: activeCategories.length === 1
        ? toCategoryFilter(activeCategories[0])
        : undefined,
      activeFilters: {
        platforms: selectedPlatformCategories.map(toCategoryFilter),
        regions: selectedRegions.map(toRegionFilter),
        types: selectedTypeCategories.map(toCategoryFilter),
      },
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
      pagination: {
        hasNextPage: productResult.page < totalPages,
        hasPreviousPage: productResult.page > 1,
        limit: productResult.limit,
        page: productResult.page,
        totalPages,
      },
      selected,
      totalItems: productResult.totalItems,
    };
  },
};
