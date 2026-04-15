import { type FilterQuery, Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { resolvePagination } from "@/lib/utils/pagination";
import { CategoryModel, type CategoryRecord } from "@/models/category.model";
import type { SearchablePaginationInput } from "@/types/common";

export interface CategoryListFilters extends SearchablePaginationInput {
  isActive?: boolean;
}

export async function listCategories(filters: CategoryListFilters = {}) {
  await connectToDatabase();

  const pagination = resolvePagination(filters);
  const query: FilterQuery<CategoryRecord> = {};

  if (typeof filters.isActive === "boolean") {
    query.isActive = filters.isActive;
  }

  if (filters.search?.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [
      { name: searchRegex },
      { slug: searchRegex },
      { description: searchRegex },
    ];
  }

  const [items, totalItems] = await Promise.all([
    CategoryModel.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean()
      .exec(),
    CategoryModel.countDocuments(query),
  ]);

  return {
    items,
    totalItems,
    ...pagination,
  };
}

export async function getCategoryById(id: string) {
  await connectToDatabase();
  return CategoryModel.findById(id).lean().exec();
}

export async function createCategory(payload: Partial<CategoryRecord>) {
  await connectToDatabase();
  return CategoryModel.create(payload);
}

export async function updateCategoryById(
  id: string,
  payload: Partial<CategoryRecord>,
) {
  await connectToDatabase();
  return CategoryModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();
}

export async function deleteCategoryById(id: string) {
  await connectToDatabase();
  return CategoryModel.findByIdAndDelete(id).lean().exec();
}

export async function countCategories() {
  await connectToDatabase();
  return CategoryModel.countDocuments();
}

export async function existsCategorySlug(slug: string, excludeId?: string) {
  await connectToDatabase();

  const query: FilterQuery<CategoryRecord> = { slug };

  if (excludeId) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const existing = await CategoryModel.exists(query);
  return Boolean(existing);
}
