import { type mongo } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { resolvePagination } from "@/lib/utils/pagination";
import { UserModel, type UserRecord } from "@/models/user.model";
import type { AuthProvider } from "@/types/entities";
import type { SearchablePaginationInput } from "@/types/common";

type UserQuery = mongo.Filter<UserRecord>;
type UserFindQuery = Parameters<typeof UserModel.find>[0];
type UserCountQuery = Parameters<typeof UserModel.countDocuments>[0];

export interface UserListFilters extends SearchablePaginationInput {
  isActive?: boolean;
  role?: "admin" | "customer";
}

export async function countUsers() {
  await connectToDatabase();
  return UserModel.countDocuments();
}

export async function listUsers(filters: UserListFilters = {}) {
  await connectToDatabase();

  const pagination = resolvePagination(filters);
  const query: UserQuery = {};

  if (filters.search?.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
    ];
  }

  if (filters.role) {
    query.role = filters.role;
  }

  if (typeof filters.isActive === "boolean") {
    query.isActive = filters.isActive;
  }

  const findQuery = query as unknown as UserFindQuery;
  const countQuery = query as unknown as UserCountQuery;

  const [items, totalItems] = await Promise.all([
    UserModel.find(findQuery)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean()
      .exec(),
    UserModel.countDocuments(countQuery),
  ]);

  return {
    items,
    totalItems,
    ...pagination,
  };
}

export async function getUserByEmail(email: string) {
  await connectToDatabase();
  return UserModel.findOne({ email: email.toLowerCase() }).lean().exec();
}

export async function getUserById(id: string) {
  await connectToDatabase();
  return UserModel.findById(id).lean().exec();
}

export async function getUserByResetTokenHash(tokenHash: string) {
  await connectToDatabase();
  return UserModel.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  })
    .lean()
    .exec();
}

export async function createUser(payload: Partial<UserRecord>) {
  await connectToDatabase();
  return UserModel.create(payload);
}

export async function updateUserById(
  id: string,
  payload: Partial<UserRecord>,
) {
  await connectToDatabase();
  return UserModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();
}

export async function updateUserPasswordAndClearReset(
  id: string,
  passwordHash: string,
) {
  await connectToDatabase();
  return UserModel.findByIdAndUpdate(
    id,
    {
      $set: { passwordHash },
      $unset: {
        passwordResetTokenHash: "",
        passwordResetExpiresAt: "",
      },
      $addToSet: {
        authProviders: "local",
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec();
}

export async function attachProviderToUser(
  email: string,
  provider: AuthProvider,
  payload: Partial<UserRecord>,
) {
  await connectToDatabase();
  return UserModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: payload,
      $addToSet: {
        authProviders: provider,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec();
}

export async function upsertUserByEmail(
  email: string,
  payload: Partial<UserRecord>,
) {
  await connectToDatabase();
  return UserModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: payload,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  )
    .lean()
    .exec();
}
