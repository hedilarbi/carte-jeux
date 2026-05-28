import { type mongo, Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { resolvePagination } from "@/lib/utils/pagination";
import { CategoryModel, type CategoryRecord } from "@/models/category.model";
import type { SearchablePaginationInput } from "@/types/common";

type CategoryQuery = mongo.Filter<CategoryRecord>;

export interface CategoryListFilters extends SearchablePaginationInput {
  isActive?: boolean;
  isPlateforme?: boolean;
}

export async function ensureCategorySortOrders() {
  await connectToDatabase();

  const missingSortOrderQuery: CategoryQuery = {
    $or: [
      { sortOrder: { $exists: false } },
      { sortOrder: { $lte: 0 } },
    ],
  };

  const [categoriesWithoutOrder, maxOrderedCategory] = await Promise.all([
    CategoryModel.find(missingSortOrderQuery)
      .sort({ createdAt: 1, _id: 1 })
      .select("_id")
      .lean()
      .exec(),
    CategoryModel.findOne({ sortOrder: { $gt: 0 } })
      .sort({ sortOrder: -1 })
      .select("sortOrder")
      .lean()
      .exec(),
  ]);

  if (categoriesWithoutOrder.length === 0) {
    return;
  }

  let nextSortOrder =
    typeof maxOrderedCategory?.sortOrder === "number"
      ? maxOrderedCategory.sortOrder + 1
      : 1;

  await CategoryModel.bulkWrite(
    categoriesWithoutOrder.map((category) => ({
      updateOne: {
        filter: { _id: category._id },
        update: {
          $set: {
            sortOrder: nextSortOrder++,
          },
        },
      },
    })),
  );
}

export async function listCategories(filters: CategoryListFilters = {}) {
  await connectToDatabase();
  await ensureCategorySortOrders();

  const pagination = resolvePagination(filters);
  const query: CategoryQuery = {};

  if (typeof filters.isActive === "boolean") {
    query.isActive = filters.isActive;
  }

  if (typeof filters.isPlateforme === "boolean") {
    query.isPlateforme = filters.isPlateforme ? true : { $ne: true };
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
      .sort({ sortOrder: 1, createdAt: 1 })
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

export async function listCategoriesBySlugs(slugs: string[]) {
  await connectToDatabase();
  return CategoryModel.find({
    slug: { $in: slugs },
    isActive: true,
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean()
    .exec();
}

export async function createCategory(payload: Partial<CategoryRecord>) {
  await connectToDatabase();
  return CategoryModel.create(payload);
}

export async function countCategoriesByIds(ids: string[]) {
  await connectToDatabase();
  return CategoryModel.countDocuments({
    _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
  });
}

export async function getNextCategorySortOrder() {
  await connectToDatabase();
  await ensureCategorySortOrders();

  const maxOrderedCategory = await CategoryModel.findOne({
    sortOrder: { $gt: 0 },
  })
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean()
    .exec();

  return typeof maxOrderedCategory?.sortOrder === "number"
    ? maxOrderedCategory.sortOrder + 1
    : 1;
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

export async function updateCategorySortOrders(categoryIds: string[]) {
  await connectToDatabase();

  await CategoryModel.bulkWrite(
    categoryIds.map((categoryId, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(categoryId) },
        update: {
          $set: {
            sortOrder: index + 1,
          },
        },
      },
    })),
  );
}

export async function compactCategorySortOrders() {
  await connectToDatabase();

  const categories = await CategoryModel.find({})
    .sort({ sortOrder: 1, createdAt: 1 })
    .select("_id")
    .lean()
    .exec();

  if (categories.length === 0) {
    return;
  }

  await CategoryModel.bulkWrite(
    categories.map((category, index) => ({
      updateOne: {
        filter: { _id: category._id },
        update: {
          $set: {
            sortOrder: index + 1,
          },
        },
      },
    })),
  );
}

export async function countCategories() {
  await connectToDatabase();
  return CategoryModel.countDocuments();
}

export async function existsCategorySlug(slug: string, excludeId?: string) {
  await connectToDatabase();

  const query: CategoryQuery = { slug };

  if (excludeId) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const existing = await CategoryModel.exists(query);
  return Boolean(existing);
}
