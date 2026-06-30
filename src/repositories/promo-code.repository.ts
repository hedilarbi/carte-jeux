import { type mongo, Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { resolvePagination } from "@/lib/utils/pagination";
import { PromoCodeModel, type PromoCodeRecord } from "@/models/promo-code.model";
import type { SearchablePaginationInput } from "@/types/common";

type PromoCodeQuery = mongo.Filter<PromoCodeRecord>;

export type PromoCodeListFilters = SearchablePaginationInput;

export async function listPromoCodes(filters: PromoCodeListFilters = {}) {
  await connectToDatabase();

  const pagination = resolvePagination(filters);
  const query: PromoCodeQuery = {};

  if (filters.search?.trim()) {
    query.code = new RegExp(filters.search.trim(), "i");
  }

  const [items, totalItems] = await Promise.all([
    PromoCodeModel.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean()
      .exec(),
    PromoCodeModel.countDocuments(query),
  ]);

  return {
    items,
    totalItems,
    ...pagination,
  };
}

export async function getPromoCodeById(id: string, includeUserUsage = false) {
  await connectToDatabase();

  const query = PromoCodeModel.findById(id);

  if (includeUserUsage) {
    query.select("+usedByUserIds");
  }

  return query.lean().exec();
}

export async function getPromoCodeByCode(
  code: string,
  includeUserUsage = false,
) {
  await connectToDatabase();

  const query = PromoCodeModel.findOne({ code: code.trim().toUpperCase() });

  if (includeUserUsage) {
    query.select("+usedByUserIds");
  }

  return query.lean().exec();
}

export async function createPromoCode(payload: Partial<PromoCodeRecord>) {
  await connectToDatabase();
  return PromoCodeModel.create(payload);
}

export async function updatePromoCodeById(
  id: string,
  payload: Partial<PromoCodeRecord>,
  unsetFields: Array<keyof PromoCodeRecord> = [],
) {
  await connectToDatabase();

  const update =
    unsetFields.length > 0
      ? {
          $set: payload,
          $unset: Object.fromEntries(unsetFields.map((field) => [field, ""])),
        }
      : payload;

  return PromoCodeModel.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();
}

export async function deletePromoCodeById(id: string) {
  await connectToDatabase();
  return PromoCodeModel.findByIdAndDelete(id).lean().exec();
}

export async function existsPromoCode(code: string, excludeId?: string) {
  await connectToDatabase();

  const query: PromoCodeQuery = { code: code.trim().toUpperCase() };

  if (excludeId) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const existing = await PromoCodeModel.exists(query);
  return Boolean(existing);
}

export async function redeemPromoCodeById(input: {
  code?: string;
  id: string;
  now: Date;
  userId?: string;
}) {
  await connectToDatabase();

  const andConditions: Record<string, unknown>[] = [
    {
      $or: [
        { usageLimit: { $exists: false } },
        { usageLimit: null },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    },
  ];
  const increment: Record<string, number> = {
    usedCount: 1,
  };

  if (input.userId) {
    const userUsagePath = `usedByUserIds.${input.userId}`;

    andConditions.push({
      $or: [
        { usageLimitPerUser: { $exists: false } },
        { usageLimitPerUser: null },
        {
          $expr: {
            $lt: [
              {
                $ifNull: [`$${userUsagePath}`, 0],
              },
              "$usageLimitPerUser",
            ],
          },
        },
      ],
    });
    increment[userUsagePath] = 1;
  }

  return PromoCodeModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(input.id),
      ...(input.code ? { code: input.code.trim().toUpperCase() } : {}),
      expiresAt: { $gt: input.now },
      $and: andConditions,
    },
    {
      $inc: increment,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec();
}
