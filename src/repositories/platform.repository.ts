import { type mongo, Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { resolvePagination } from "@/lib/utils/pagination";
import { PlatformModel, type PlatformRecord } from "@/models/platform.model";
import type { SearchablePaginationInput } from "@/types/common";

type PlatformQuery = mongo.Filter<PlatformRecord>;

export interface PlatformListFilters extends SearchablePaginationInput {
  isActive?: boolean;
}

export async function listPlatforms(filters: PlatformListFilters = {}) {
  await connectToDatabase();

  const pagination = resolvePagination(filters);
  const query: PlatformQuery = {};

  if (typeof filters.isActive === "boolean") {
    query.isActive = filters.isActive;
  }

  if (filters.search?.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [
      { name: searchRegex },
      { slug: searchRegex },
      { logo: searchRegex },
    ];
  }

  const [items, totalItems] = await Promise.all([
    PlatformModel.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean()
      .exec(),
    PlatformModel.countDocuments(query),
  ]);

  return {
    items,
    totalItems,
    ...pagination,
  };
}

export async function getPlatformById(id: string) {
  await connectToDatabase();
  return PlatformModel.findById(id).lean().exec();
}

export async function createPlatform(payload: Partial<PlatformRecord>) {
  await connectToDatabase();
  return PlatformModel.create(payload);
}

export async function updatePlatformById(
  id: string,
  payload: Partial<PlatformRecord>,
) {
  await connectToDatabase();
  return PlatformModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();
}

export async function deletePlatformById(id: string) {
  await connectToDatabase();
  return PlatformModel.findByIdAndDelete(id).lean().exec();
}

export async function existsPlatformSlug(slug: string, excludeId?: string) {
  await connectToDatabase();

  const query: PlatformQuery = { slug };

  if (excludeId) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const existing = await PlatformModel.exists(query);
  return Boolean(existing);
}
