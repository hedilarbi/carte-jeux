import { Types } from "mongoose";

import { calculateDiscountedPrice, roundMoney } from "@/lib/utils/pricing";
import { serializeDocument } from "@/lib/utils/serialization";
import { generateUniqueSlug } from "@/lib/utils/slug";
import type { ProductRecord } from "@/models/product.model";
import {
  bulkWriteProducts,
  createProduct,
  existsProductSlug,
  getProductByG2AProductId,
  getProductBySku,
  listProductsByG2AProductIdsOrSkus,
  updateProductById,
} from "@/repositories/product.repository";
import {
  fetchG2AProductDetails,
  fetchG2AProductOffers,
  type G2AProductDetails,
  type G2AProductOffer,
} from "@/services/g2a-export.service";
import {
  getG2AProductMappingContext,
  mapG2AToLocalProductPreview,
} from "@/services/g2a-product-mapping.service";
import { g2aTaxonomyService } from "@/services/g2a-taxonomy.service";
import type { Product } from "@/types/entities";

const DEFAULT_TEST_IMPORT_LIMIT = 3;
const MAX_TEST_IMPORT_LIMIT = 10;
const G2A_MIN_ITEMS_PER_PAGE = 10;
const DEFAULT_IMPORT_ITEMS_PER_PAGE = 100;
const G2A_IMPORT_ITEMS_PER_PAGE_VALUES = [10, 20, 50, 100] as const;

type UnknownRecord = Record<string, unknown>;
type BulkImportResultItem =
  | {
      action: "created" | "updated";
      productId: string;
      title?: string;
    }
  | {
      action: "skipped";
      productId?: string;
      title?: string;
      blockingMissingFields: string[];
    };

interface TestImportInput {
  page?: number;
  limit?: number;
}

interface ProductImportPageInput {
  page?: number;
  itemsPerPage?: number;
  syncTaxonomies?: boolean;
}

function normalizePage(value: number | undefined) {
  return Number.isFinite(value) && value && value > 0 ? Math.floor(value) : 1;
}

function normalizeItemsPerPage(value: number | undefined) {
  const normalizedValue =
    Number.isFinite(value) && value && value > 0
      ? Math.floor(value)
      : DEFAULT_IMPORT_ITEMS_PER_PAGE;

  return G2A_IMPORT_ITEMS_PER_PAGE_VALUES.includes(
    normalizedValue as (typeof G2A_IMPORT_ITEMS_PER_PAGE_VALUES)[number],
  )
    ? normalizedValue
    : DEFAULT_IMPORT_ITEMS_PER_PAGE;
}

function normalizeLimit(value: number | undefined) {
  if (!Number.isFinite(value) || !value || value <= 0) {
    return DEFAULT_TEST_IMPORT_LIMIT;
  }

  return Math.min(Math.floor(value), MAX_TEST_IMPORT_LIMIT);
}

function getStringLikeField(record: UnknownRecord, field: string) {
  const value = record[field];

  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function getNestedStringLikeField(
  record: UnknownRecord,
  nestedField: string,
  field: string,
) {
  const nested = record[nestedField];

  if (!nested || typeof nested !== "object" || Array.isArray(nested)) {
    return undefined;
  }

  return getStringLikeField(nested as UnknownRecord, field);
}

function getG2AProductId(productOffer: G2AProductOffer) {
  const record = productOffer as UnknownRecord;

  return (
    getStringLikeField(record, "productId") ??
    getStringLikeField(record, "id") ??
    getNestedStringLikeField(record, "product", "id") ??
    getNestedStringLikeField(record, "product", "productId")
  );
}

function getResponseItems<T>(response: { data?: T[]; items?: T[] } | null) {
  return response?.data ?? response?.items ?? [];
}

function getDetailsId(details: G2AProductDetails) {
  const record = details as UnknownRecord;

  return getStringLikeField(record, "productId") ?? getStringLikeField(record, "id");
}

function getDetailsMap(details: G2AProductDetails[]) {
  return new Map(
    details
      .map((item) => [getDetailsId(item), item] as const)
      .filter((item): item is [string, G2AProductDetails] => Boolean(item[0])),
  );
}

function toObjectId(value: string) {
  return new Types.ObjectId(value);
}

function limitText(value: string | undefined, maxLength: number) {
  if (!value) {
    return undefined;
  }

  return value.trim().slice(0, maxLength) || undefined;
}

function toDate(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

async function findExistingG2AProduct(productId: string, sku: string) {
  return (await getProductByG2AProductId(productId)) ?? (await getProductBySku(sku));
}

async function buildCreatePayload(
  mapping: ReturnType<typeof mapG2AToLocalProductPreview>,
  reservedSlugs?: Set<string>,
) {
  const product = mapping.currentProductPayload;
  const g2a = mapping.g2aExtension.g2a;

  if (
    !g2a.productId ||
    !product.categoryId ||
    !product.platformId ||
    !product.regionId
  ) {
    return null;
  }

  const price = roundMoney(product.price);
  const slug = await generateUniqueSlug(product.slug, async (slugCandidate) =>
    Boolean(reservedSlugs?.has(slugCandidate)) ||
    (await existsProductSlug(slugCandidate)),
  );

  reservedSlugs?.add(slug);

  return {
    title: limitText(product.title, 180),
    slug,
    shortDescription: limitText(product.shortDescription, 300),
    description: limitText(product.description, 4000),
    image: limitText(product.image, 500),
    gallery: product.gallery,
    categoryId: toObjectId(product.categoryId),
    categoryIds: product.categoryIds.map(toObjectId),
    platformId: toObjectId(product.platformId),
    regionId: toObjectId(product.regionId),
    regionIds: product.regionIds.map(toObjectId),
    faceValue: roundMoney(product.faceValue),
    currency: product.currency,
    price,
    discountPercent: product.discountPercent,
    finalPrice: calculateDiscountedPrice(price, product.discountPercent),
    sku: product.sku,
    productType: product.productType,
    deliveryMode: product.deliveryMode,
    supplier: "g2a",
    stock: mapping.g2aExtension.stock,
    autoPricing: mapping.g2aExtension.autoPricing,
    g2a: {
      ...g2a,
      productId: g2a.productId,
      lastSyncedAt: toDate(g2a.lastSyncedAt),
      lastCatalogSyncedAt: toDate(g2a.lastCatalogSyncedAt),
    },
    isFeatured: product.isFeatured,
    isActive: true,
    faqItems: product.faqItems,
    seoTitle: limitText(product.seoTitle, 160),
    seoDescription: limitText(product.seoDescription, 320),
  } satisfies Partial<ProductRecord>;
}

function buildUpdatePayload(
  existing: ProductRecord & { _id: unknown },
  mapping: ReturnType<typeof mapG2AToLocalProductPreview>,
) {
  const product = mapping.currentProductPayload;
  const g2a = mapping.g2aExtension.g2a;
  const updatePayload: Partial<ProductRecord> = {
    supplier: "g2a",
    stock: mapping.g2aExtension.stock,
    autoPricing: existing.autoPricing ?? true,
    g2a: {
      ...g2a,
      productId: g2a.productId ?? existing.g2a?.productId ?? product.sku,
      lastSyncedAt: toDate(g2a.lastSyncedAt),
      lastCatalogSyncedAt: toDate(g2a.lastCatalogSyncedAt),
    },
    isActive: true,
  };

  if (existing.autoPricing !== false) {
    const price = roundMoney(product.price);
    updatePayload.faceValue = roundMoney(product.faceValue);
    updatePayload.price = price;
    updatePayload.finalPrice = calculateDiscountedPrice(
      price,
      existing.discountPercent ?? product.discountPercent,
    );
  }

  return updatePayload;
}

export const g2aProductImportService = {
  async importProductPageBulk(input: ProductImportPageInput = {}) {
    const page = normalizePage(input.page);
    const itemsPerPage = normalizeItemsPerPage(input.itemsPerPage);
    const offersResponse = await fetchG2AProductOffers(page, itemsPerPage);
    const productOffers = getResponseItems(offersResponse);
    const productIds = productOffers
      .map(getG2AProductId)
      .filter((productId): productId is string => Boolean(productId));
    const details = await fetchG2AProductDetails(productIds);
    const taxonomySync = input.syncTaxonomies
      ? await g2aTaxonomyService.syncFromProductDetails(details)
      : null;
    const mappingContext = await getG2AProductMappingContext();
    const detailsMap = getDetailsMap(details);
    const skippedResults: BulkImportResultItem[] = [];
    const candidates = [];

    for (const productOffer of productOffers) {
      const productId = getG2AProductId(productOffer);
      const productDetails = productId ? detailsMap.get(productId) : undefined;
      const mapping = mapG2AToLocalProductPreview({
        productOffer,
        productDetails,
        context: mappingContext,
      });

      if (!mapping.canCreateWithCurrentSchema || !productId) {
        skippedResults.push({
          action: "skipped" as const,
          productId,
          title: productDetails?.name,
          blockingMissingFields: mapping.blockingMissingFields,
        });
        continue;
      }

      candidates.push({
        productId,
        productDetails,
        mapping,
      });
    }

    const existingProducts = await listProductsByG2AProductIdsOrSkus(
      candidates.map((candidate) => candidate.productId),
      candidates.map((candidate) => candidate.mapping.currentProductPayload.sku),
    );
    const existingByG2AProductId = new Map(
      existingProducts
        .map((product) => {
          const existingProduct = product as ProductRecord & { _id: unknown };
          return [existingProduct.g2a?.productId, existingProduct] as const;
        })
        .filter(
          (item): item is [string, ProductRecord & { _id: unknown }] =>
            Boolean(item[0]),
        ),
    );
    const existingBySku = new Map(
      existingProducts.map((product) => {
        const existingProduct = product as ProductRecord & { _id: unknown };
        return [existingProduct.sku, existingProduct] as const;
      }),
    );
    const operations: Parameters<typeof bulkWriteProducts>[0] = [];
    const reservedSlugs = new Set<string>();
    const results: BulkImportResultItem[] = [...skippedResults];
    let created = 0;
    let updated = 0;

    for (const candidate of candidates) {
      const existing =
        existingByG2AProductId.get(candidate.productId) ??
        existingBySku.get(candidate.mapping.currentProductPayload.sku);

      if (existing) {
        operations.push({
          updateOne: {
            filter: { _id: existing._id },
            update: {
              $set: buildUpdatePayload(existing, candidate.mapping),
            },
          },
        });
        updated += 1;
        results.push({
          action: "updated" as const,
          productId: candidate.productId,
          title: candidate.productDetails?.name,
        });
        continue;
      }

      const createPayload = await buildCreatePayload(
        candidate.mapping,
        reservedSlugs,
      );

      if (!createPayload) {
        results.push({
          action: "skipped" as const,
          productId: candidate.productId,
          title: candidate.productDetails?.name,
          blockingMissingFields: candidate.mapping.blockingMissingFields,
        });
        continue;
      }

      operations.push({
        insertOne: {
          document: createPayload as unknown as ProductRecord,
        },
      });
      created += 1;
      results.push({
        action: "created" as const,
        productId: candidate.productId,
        title: candidate.productDetails?.name,
      });
    }

    const bulkWriteResult = await bulkWriteProducts(operations);
    const skipped = results.filter((result) => result.action === "skipped").length;

    return {
      page,
      itemsPerPage,
      scanned: {
        productOffers: productOffers.length,
        productIds: productIds.length,
        productDetails: details.length,
      },
      summary: {
        created,
        updated,
        skipped,
        errors: 0,
      },
      taxonomySync,
      bulkWrite: bulkWriteResult
        ? {
            insertedCount: bulkWriteResult.insertedCount,
            matchedCount: bulkWriteResult.matchedCount,
            modifiedCount: bulkWriteResult.modifiedCount,
            upsertedCount: bulkWriteResult.upsertedCount,
          }
        : null,
      results,
    };
  },

  async importFirstProducts(input: TestImportInput = {}) {
    const page = normalizePage(input.page);
    const limit = normalizeLimit(input.limit);
    const offersResponse = await fetchG2AProductOffers(
      page,
      Math.max(limit, G2A_MIN_ITEMS_PER_PAGE),
    );
    const productOffers = getResponseItems(offersResponse).slice(0, limit);
    const productIds = productOffers
      .map(getG2AProductId)
      .filter((productId): productId is string => Boolean(productId));
    const [details, mappingContext] = await Promise.all([
      fetchG2AProductDetails(productIds),
      getG2AProductMappingContext(),
    ]);
    const detailsMap = getDetailsMap(details);
    const results = [];

    for (const productOffer of productOffers) {
      const productId = getG2AProductId(productOffer);
      const productDetails = productId ? detailsMap.get(productId) : undefined;
      const mapping = mapG2AToLocalProductPreview({
        productOffer,
        productDetails,
        context: mappingContext,
      });

      if (!mapping.canCreateWithCurrentSchema || !productId) {
        results.push({
          action: "skipped" as const,
          productId,
          title: productDetails?.name,
          blockingMissingFields: mapping.blockingMissingFields,
          mapping,
        });
        continue;
      }

      const existing = await findExistingG2AProduct(
        productId,
        mapping.currentProductPayload.sku,
      );

      if (existing) {
        const updated = await updateProductById(
          String(existing._id),
          buildUpdatePayload(existing as ProductRecord & { _id: unknown }, mapping),
        );

        results.push({
          action: "updated" as const,
          productId,
          product: serializeDocument<Product>(updated),
          mapping,
        });
        continue;
      }

      const createPayload = await buildCreatePayload(mapping);

      if (!createPayload) {
        results.push({
          action: "skipped" as const,
          productId,
          title: productDetails?.name,
          blockingMissingFields: mapping.blockingMissingFields,
          mapping,
        });
        continue;
      }

      const created = await createProduct(createPayload);

      results.push({
        action: "created" as const,
        productId,
        product: serializeDocument<Product>(created),
        mapping,
      });
    }

    return {
      page,
      limit,
      scanned: {
        productOffers: productOffers.length,
        productIds: productIds.length,
        productDetails: details.length,
      },
      summary: {
        created: results.filter((result) => result.action === "created").length,
        updated: results.filter((result) => result.action === "updated").length,
        skipped: results.filter((result) => result.action === "skipped").length,
      },
      results,
    };
  },
};
