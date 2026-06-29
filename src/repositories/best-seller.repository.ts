import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import {
  BestSellerModel,
  type BestSellerRecord,
} from "@/models/best-seller.model";

export async function listBestSellerItems() {
  await connectToDatabase();

  return BestSellerModel.find({})
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean()
    .exec();
}

export async function replaceBestSellerItems(productIds: string[]) {
  await connectToDatabase();

  const productObjectIds = productIds.map((productId) => new Types.ObjectId(productId));

  if (productObjectIds.length === 0) {
    await BestSellerModel.deleteMany({});
    return [];
  }

  await BestSellerModel.deleteMany({
    productId: { $nin: productObjectIds },
  });

  await BestSellerModel.bulkWrite(
    productObjectIds.map((productId, index) => ({
      updateOne: {
        filter: { productId },
        update: {
          $set: {
            productId,
            sortOrder: index + 1,
          } satisfies Partial<BestSellerRecord>,
        },
        upsert: true,
      },
    })),
  );

  return listBestSellerItems();
}
