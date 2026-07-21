import { type mongo, type SortOrder, Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { resolvePagination } from "@/lib/utils/pagination";
import { ProductModel, type ProductRecord } from "@/models/product.model";
import type { SearchablePaginationInput } from "@/types/common";

type ProductQuery = mongo.Filter<ProductRecord>;
type ProductFindQuery = Parameters<typeof ProductModel.find>[0];
type ProductCountQuery = Parameters<typeof ProductModel.countDocuments>[0];
type ProductExistsQuery = Parameters<typeof ProductModel.exists>[0];
type ProductBulkWriteOperations = Parameters<typeof ProductModel.bulkWrite>[0];

export interface ProductListFilters extends SearchablePaginationInput {
  categoryId?: string;
  categoryIds?: string[];
  platformId?: string;
  platformIds?: string[];
  regionId?: string;
  regionIds?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  priceMax?: number | string | null;
  priceMin?: number | string | null;
  sort?: string | null;
}

function resolveNumericFilter(value: number | string | null | undefined) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue >= 0
    ? numberValue
    : undefined;
}

function resolveProductSort(sort?: string | null): Record<string, SortOrder> {
  switch (sort) {
    case "price-asc":
      return { finalPrice: 1, createdAt: -1 };
    case "price-desc":
      return { finalPrice: -1, createdAt: -1 };
    case "new":
      return { createdAt: -1 };
    case "popular":
      return { isFeatured: -1, createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
}

function resolveObjectIds(ids: Array<string | undefined>) {
  return ids
    .filter((id): id is string => Boolean(id && Types.ObjectId.isValid(id)))
    .map((id) => new Types.ObjectId(id));
}

export async function listProducts(filters: ProductListFilters = {}) {
  await connectToDatabase();

  const pagination = resolvePagination(filters);
  const query: ProductQuery = {};
  const andFilters: ProductQuery[] = [];

  const categoryObjectIds = resolveObjectIds([
    filters.categoryId,
    ...(filters.categoryIds ?? []),
  ]);

  if (categoryObjectIds.length > 0) {
    andFilters.push({
      $or: [
        { categoryIds: { $in: categoryObjectIds } },
        { categoryId: { $in: categoryObjectIds } },
      ],
    });
  }

  const platformObjectIds = resolveObjectIds([
    filters.platformId,
    ...(filters.platformIds ?? []),
  ]);

  if (platformObjectIds.length > 0) {
    andFilters.push({
      $or: [
        { platformId: { $in: platformObjectIds } },
        { categoryIds: { $in: platformObjectIds } },
        { categoryId: { $in: platformObjectIds } },
      ],
    });
  }

  const regionObjectIds = resolveObjectIds([
    filters.regionId,
    ...(filters.regionIds ?? []),
  ]);

  if (regionObjectIds.length > 0) {
    andFilters.push({
      $or: [
        { regionIds: { $in: regionObjectIds } },
        { regionId: { $in: regionObjectIds } },
      ],
    });
  }

  if (typeof filters.isActive === "boolean") {
    query.isActive = filters.isActive;
  }

  if (typeof filters.isFeatured === "boolean") {
    query.isFeatured = filters.isFeatured;
  }

  const priceMin = resolveNumericFilter(filters.priceMin);
  const priceMax = resolveNumericFilter(filters.priceMax);

  if (typeof priceMin === "number" || typeof priceMax === "number") {
    query.finalPrice = {
      ...(typeof priceMin === "number" ? { $gte: priceMin } : {}),
      ...(typeof priceMax === "number" ? { $lte: priceMax } : {}),
    };
  }

  if (filters.search?.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    andFilters.push({
      $or: [
        { title: searchRegex },
        { slug: searchRegex },
        { sku: searchRegex },
        { shortDescription: searchRegex },
      ],
    });
  }

  if (andFilters.length > 0) {
    query.$and = andFilters;
  }

  const findQuery = query as unknown as ProductFindQuery;
  const countQuery = query as unknown as ProductCountQuery;

  const [items, totalItems] = await Promise.all([
    ProductModel.find(findQuery)
      .sort(resolveProductSort(filters.sort))
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean()
      .exec(),
    ProductModel.countDocuments(countQuery),
  ]);

  return {
    items,
    totalItems,
    ...pagination,
  };
}

export async function listActiveProductsByCategoryOrPlatformId(
  categoryId: string,
  limit = 8,
) {
  await connectToDatabase();

  const categoryObjectId = new Types.ObjectId(categoryId);

  return ProductModel.find({
    isActive: true,
    $or: [
      { categoryIds: categoryObjectId },
      { categoryId: categoryObjectId },
      { platformId: categoryObjectId },
    ],
  } as unknown as ProductFindQuery)
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(limit)
    .lean()
    .exec();
}

export async function listProductsByIds(
  ids: string[],
  options: { isActive?: boolean } = {},
) {
  await connectToDatabase();

  const productObjectIds = resolveObjectIds(ids);

  if (productObjectIds.length === 0) {
    return [];
  }

  return ProductModel.find({
    _id: { $in: productObjectIds },
    ...(typeof options.isActive === "boolean"
      ? { isActive: options.isActive }
      : {}),
  } as unknown as ProductFindQuery)
    .lean()
    .exec();
}

export async function listActiveProductsForSelection() {
  await connectToDatabase();

  return ProductModel.find({ isActive: true } as unknown as ProductFindQuery)
    .sort({ title: 1, createdAt: -1 })
    .lean()
    .exec();
}

export async function listProductsForCsvExport() {
  await connectToDatabase();

  return ProductModel.find({} as ProductFindQuery)
    .select({ _id: 0, slug: 1, title: 1 })
    .sort({ title: 1 })
    .lean()
    .exec();
}

export async function countProductsByIds(ids: string[]) {
  await connectToDatabase();

  const productObjectIds = resolveObjectIds(ids);

  if (productObjectIds.length === 0) {
    return 0;
  }

  return ProductModel.countDocuments({
    _id: { $in: productObjectIds },
  } as unknown as ProductCountQuery);
}

export async function countProducts() {
  await connectToDatabase();
  return ProductModel.countDocuments();
}

export async function countProductsByCategoryId(categoryId: string) {
  await connectToDatabase();
  const categoryObjectId = new Types.ObjectId(categoryId);

  return ProductModel.countDocuments({
    $or: [
      { categoryIds: categoryObjectId },
      { categoryId: categoryObjectId },
      { platformId: categoryObjectId },
    ],
  });
}

export async function countProductsByRegionId(regionId: string) {
  await connectToDatabase();
  const regionObjectId = new Types.ObjectId(regionId);

  return ProductModel.countDocuments({
    $or: [{ regionIds: regionObjectId }, { regionId: regionObjectId }],
  });
}

export async function getProductById(id: string) {
  await connectToDatabase();
  return ProductModel.findById(id).lean().exec();
}

export async function getProductBySlug(slug: string) {
  await connectToDatabase();
  return ProductModel.findOne({ slug }).lean().exec();
}

export async function getProductBySku(sku: string) {
  await connectToDatabase();
  return ProductModel.findOne({ sku: sku.toUpperCase() }).lean().exec();
}

export async function getProductByG2AProductId(productId: string) {
  await connectToDatabase();
  return ProductModel.findOne({
    "g2a.productId": productId,
  } as unknown as ProductFindQuery)
    .lean()
    .exec();
}

export async function listProductsByG2AProductIdsOrSkus(
  productIds: string[],
  skus: string[],
) {
  await connectToDatabase();

  const normalizedProductIds = Array.from(
    new Set(productIds.map((productId) => productId.trim()).filter(Boolean)),
  );
  const normalizedSkus = Array.from(
    new Set(skus.map((sku) => sku.trim().toUpperCase()).filter(Boolean)),
  );
  const filters: ProductQuery[] = [];

  if (normalizedProductIds.length > 0) {
    filters.push({ "g2a.productId": { $in: normalizedProductIds } });
  }

  if (normalizedSkus.length > 0) {
    filters.push({ sku: { $in: normalizedSkus } });
  }

  if (filters.length === 0) {
    return [];
  }

  return ProductModel.find({ $or: filters } as unknown as ProductFindQuery)
    .lean()
    .exec();
}

export async function listG2AProductsForStockSync(input: {
  afterId?: string;
  limit: number;
}) {
  await connectToDatabase();

  const query: ProductQuery = {
    supplier: "g2a",
    "g2a.productId": { $exists: true, $ne: "" },
  };

  if (input.afterId && Types.ObjectId.isValid(input.afterId)) {
    query._id = { $gt: new Types.ObjectId(input.afterId) };
  }

  return ProductModel.find(query as unknown as ProductFindQuery)
    .sort({ _id: 1 })
    .limit(Math.max(1, Math.min(Math.floor(input.limit), 100)))
    .lean()
    .exec();
}

export async function createProduct(payload: Partial<ProductRecord>) {
  await connectToDatabase();
  return ProductModel.create(payload);
}

export async function bulkWriteProducts(operations: ProductBulkWriteOperations) {
  await connectToDatabase();

  if (operations.length === 0) {
    return null;
  }

  return ProductModel.bulkWrite(operations, {
    ordered: false,
  });
}

export async function updateProductById(id: string, payload: Partial<ProductRecord>) {
  await connectToDatabase();
  return ProductModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();
}

export async function deleteProductById(id: string) {
  await connectToDatabase();
  return ProductModel.findByIdAndDelete(id).lean().exec();
}

export async function existsProductSlug(slug: string, excludeId?: string) {
  await connectToDatabase();

  const query: ProductQuery = { slug };

  if (excludeId) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const existing = await ProductModel.exists(
    query as unknown as ProductExistsQuery,
  );
  return Boolean(existing);
}

export async function existsProductSku(sku: string, excludeId?: string) {
  await connectToDatabase();

  const query: ProductQuery = { sku };

  if (excludeId) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const existing = await ProductModel.exists(
    query as unknown as ProductExistsQuery,
  );
  return Boolean(existing);
}
