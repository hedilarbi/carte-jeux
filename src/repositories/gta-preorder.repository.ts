import type { mongo } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { resolvePagination } from "@/lib/utils/pagination";
import {
  GtaPreorderModel,
  type GtaPreorderRecord,
} from "@/models/gta-preorder.model";
import type { SearchablePaginationInput } from "@/types/common";

export type GtaPreorderListFilters = SearchablePaginationInput;

export async function createGtaPreorder(payload: Partial<GtaPreorderRecord>) {
  await connectToDatabase();
  return GtaPreorderModel.create(payload);
}

export async function listGtaPreorders(
  filters: GtaPreorderListFilters = {},
) {
  await connectToDatabase();

  const pagination = resolvePagination(filters);
  const query: mongo.Filter<GtaPreorderRecord> = {};

  if (filters.search?.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const [items, totalItems] = await Promise.all([
    GtaPreorderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean()
      .exec(),
    GtaPreorderModel.countDocuments(query),
  ]);

  return {
    items,
    totalItems,
    ...pagination,
  };
}
