import { type FilterQuery, Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { resolvePagination } from "@/lib/utils/pagination";
import { RegionModel, type RegionRecord } from "@/models/region.model";
import type { SearchablePaginationInput } from "@/types/common";

export interface RegionListFilters extends SearchablePaginationInput {
  isActive?: boolean;
}

export async function listRegions(filters: RegionListFilters = {}) {
  await connectToDatabase();

  const pagination = resolvePagination(filters);
  const query: FilterQuery<RegionRecord> = {};

  if (typeof filters.isActive === "boolean") {
    query.isActive = filters.isActive;
  }

  if (filters.search?.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [
      { name: searchRegex },
      { code: searchRegex },
      { description: searchRegex },
    ];
  }

  const [items, totalItems] = await Promise.all([
    RegionModel.find(query)
      .sort({ name: 1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean()
      .exec(),
    RegionModel.countDocuments(query),
  ]);

  return {
    items,
    totalItems,
    ...pagination,
  };
}

export async function listAllRegions() {
  await connectToDatabase();
  return RegionModel.find({ isActive: true }).sort({ name: 1 }).lean().exec();
}

export async function getRegionById(id: string) {
  await connectToDatabase();
  return RegionModel.findById(id).lean().exec();
}

export async function createRegion(payload: Partial<RegionRecord>) {
  await connectToDatabase();
  return RegionModel.create(payload);
}

export async function updateRegionById(id: string, payload: Partial<RegionRecord>) {
  await connectToDatabase();
  return RegionModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();
}

export async function deleteRegionById(id: string) {
  await connectToDatabase();
  return RegionModel.findByIdAndDelete(id).lean().exec();
}

export async function existsRegionCode(code: string, excludeId?: string) {
  await connectToDatabase();

  const query: FilterQuery<RegionRecord> = { code };

  if (excludeId) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const existing = await RegionModel.exists(query);
  return Boolean(existing);
}
