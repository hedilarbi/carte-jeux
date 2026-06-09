import { serializeDocument } from "@/lib/utils/serialization";
import { listCategories } from "@/repositories/category.repository";
import {
  getProductBySlug,
  listProducts,
} from "@/repositories/product.repository";
import { listAllRegions } from "@/repositories/region.repository";
import type { Category, Product, ProductFaqItem, Region } from "@/types/entities";

export interface ProductDetailCategory {
  id: string;
  image?: string;
  label: string;
  slug: string;
}

export interface ProductDetailRegion {
  code: string;
  id: string;
  label: string;
}

export interface ProductDetailRelatedProduct {
  id: string;
  image?: string;
  platformImage?: string;
  platformName: string;
  price: string;
  slug: string;
  title: string;
}

export interface ProductDetailPageContent {
  categories: ProductDetailCategory[];
  currency: string;
  description?: string;
  discountPercent: number;
  faceValue: number;
  faqItems: ProductFaqItem[];
  gallery: string[];
  id: string;
  image?: string;
  originalPrice?: string;
  platform: ProductDetailCategory;
  points: number;
  price: string;
  regions: ProductDetailRegion[];
  relatedProducts: ProductDetailRelatedProduct[];
  seoDescription?: string;
  seoTitle?: string;
  shortDescription?: string;
  sku: string;
  slug: string;
  title: string;
}

function formatPrice(value: number) {
  return value.toFixed(3);
}

function toDetailCategory(category: Category): ProductDetailCategory {
  return {
    id: category._id,
    image: category.image,
    label: category.name,
    slug: category.slug,
  };
}

function toDetailRegion(region: Region): ProductDetailRegion {
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

function resolveProductCategories(
  product: Product,
  categoryMap: Map<string, Category>,
) {
  const categories = product.categoryIds
    .map((categoryId) => categoryMap.get(categoryId))
    .filter((category): category is Category => Boolean(category));

  const fallbackCategory = categoryMap.get(product.categoryId);

  if (
    fallbackCategory &&
    !categories.some((category) => category._id === fallbackCategory._id)
  ) {
    categories.push(fallbackCategory);
  }

  return categories.filter((category) => !category.isPlateforme);
}

function resolveProductRegions(
  product: Product,
  regionMap: Map<string, Region>,
) {
  const regions = product.regionIds
    .map((regionId) => regionMap.get(regionId))
    .filter((region): region is Region => Boolean(region));
  const fallbackRegion = product.regionId
    ? regionMap.get(product.regionId)
    : undefined;

  if (
    fallbackRegion &&
    !regions.some((region) => region._id === fallbackRegion._id)
  ) {
    regions.push(fallbackRegion);
  }

  return regions;
}

function toRelatedProduct(
  product: Product,
  categoryMap: Map<string, Category>,
): ProductDetailRelatedProduct {
  const platform = resolveProductPlatform(product, categoryMap);

  return {
    id: product._id,
    image: product.image,
    platformImage: platform?.image,
    platformName: platform?.name ?? "Global",
    price: formatPrice(product.finalPrice),
    slug: product.slug,
    title: product.title,
  };
}

export const productDetailService = {
  async getBySlug(slug: string): Promise<ProductDetailPageContent | null> {
    const productDocument = await getProductBySlug(slug);

    if (!productDocument) {
      return null;
    }

    const product = serializeDocument<Product>(productDocument);

    if (!product.isActive) {
      return null;
    }

    const [categoryResult, regionDocuments] = await Promise.all([
      listCategories({
        page: 1,
        limit: 100,
        isActive: true,
      }),
      listAllRegions(),
    ]);
    const categories = serializeDocument<Category[]>(categoryResult.items);
    const regions = serializeDocument<Region[]>(regionDocuments);
    const categoryMap = new Map(
      categories.map((category) => [category._id, category]),
    );
    const regionMap = new Map(regions.map((region) => [region._id, region]));
    const platform = resolveProductPlatform(product, categoryMap);
    const productCategories = resolveProductCategories(product, categoryMap);
    const productRegions = resolveProductRegions(product, regionMap);
    const relatedResult = await listProducts({
      page: 1,
      limit: 5,
      isActive: true,
      platformId: platform?._id,
      categoryId: productCategories[0]?._id,
      sort: "popular",
    });
    const relatedProducts = serializeDocument<Product[]>(relatedResult.items)
      .filter((relatedProduct) => relatedProduct._id !== product._id)
      .slice(0, 5)
      .map((relatedProduct) => toRelatedProduct(relatedProduct, categoryMap));
    const gallery = [
      product.image,
      ...product.gallery,
    ].filter((image): image is string => Boolean(image));

    return {
      categories: productCategories.map(toDetailCategory),
      currency: product.currency,
      description: product.description,
      discountPercent: product.discountPercent,
      faceValue: product.faceValue,
      faqItems: product.faqItems ?? [],
      gallery,
      id: product._id,
      image: product.image,
      originalPrice:
        product.discountPercent > 0 && product.price > product.finalPrice
          ? formatPrice(product.price)
          : undefined,
      platform: platform
        ? toDetailCategory(platform)
        : {
            id: "global",
            label: "Global",
            slug: "global",
          },
      points: Math.max(1, Math.round(product.finalPrice * 5)),
      price: formatPrice(product.finalPrice),
      regions: productRegions.map(toDetailRegion),
      relatedProducts,
      seoDescription: product.seoDescription,
      seoTitle: product.seoTitle,
      shortDescription: product.shortDescription,
      sku: product.sku,
      slug: product.slug,
      title: product.title,
    };
  },
};
