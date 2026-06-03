import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import {
  FavoriteListModel,
  type FavoriteListRecord,
} from "@/models/favorite-list.model";

export async function getFavoriteListBySessionId(sessionId: string) {
  await connectToDatabase();
  return FavoriteListModel.findOne({ sessionId }).lean().exec();
}

export async function getFavoriteListByUserId(userId: string) {
  await connectToDatabase();
  return FavoriteListModel.findOne({ userId: new Types.ObjectId(userId) })
    .lean()
    .exec();
}

export async function createFavoriteList(payload: Partial<FavoriteListRecord>) {
  await connectToDatabase();
  return FavoriteListModel.create(payload);
}

export async function updateFavoriteListById(
  id: string,
  payload: Partial<FavoriteListRecord>,
) {
  await connectToDatabase();
  return FavoriteListModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();
}

export async function deleteFavoriteListById(id: string) {
  await connectToDatabase();
  return FavoriteListModel.findByIdAndDelete(id).lean().exec();
}
