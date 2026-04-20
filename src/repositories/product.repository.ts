import { type mongo, Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { resolvePagination } from "@/lib/utils/pagination";
import { ProductModel, type ProductRecord } from "@/models/product.model";
import type { SearchablePaginationInput } from "@/types/common";

type ProductQuery = mongo.Filter<ProductRecord>;
type ProductFindQuery = Parameters<typeof ProductModel.find>[0];
type ProductCountQuery = Parameters<typeof ProductModel.countDocuments>[0];
type ProductExistsQuery = Parameters<typeof ProductModel.exists>[0];

export interface ProductListFilters extends SearchablePaginationInput {
  categoryId?: string;
  platformId?: string;
  regionId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export async function listProducts(filters: ProductListFilters = {}) {
  await connectToDatabase();

  const pagination = resolvePagination(filters);
  const query: ProductQuery = {};
  const andFilters: ProductQuery[] = [];

  if (filters.categoryId) {
    query.categoryId = new Types.ObjectId(filters.categoryId);
  }

  if (filters.platformId) {
    query.platformId = new Types.ObjectId(filters.platformId);
  }

  if (filters.regionId) {
    const regionObjectId = new Types.ObjectId(filters.regionId);
    andFilters.push({
      $or: [{ regionIds: regionObjectId }, { regionId: regionObjectId }],
    });
  }

  if (typeof filters.isActive === "boolean") {
    query.isActive = filters.isActive;
  }

  if (typeof filters.isFeatured === "boolean") {
    query.isFeatured = filters.isFeatured;
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
      .sort({ createdAt: -1 })
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

export async function countProducts() {
  await connectToDatabase();
  return ProductModel.countDocuments();
}

export async function countProductsByCategoryId(categoryId: string) {
  await connectToDatabase();
  return ProductModel.countDocuments({ categoryId: new Types.ObjectId(categoryId) });
}

export async function countProductsByPlatformId(platformId: string) {
  await connectToDatabase();
  return ProductModel.countDocuments({ platformId: new Types.ObjectId(platformId) });
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

export async function createProduct(payload: Partial<ProductRecord>) {
  await connectToDatabase();
  return ProductModel.create(payload);
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
