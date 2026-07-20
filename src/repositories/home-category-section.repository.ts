import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { HomeCategorySectionModel } from "@/models/home-category-section.model";

const SECTION_KEY = "home-categories";

export async function getHomeCategorySection() {
  await connectToDatabase();
  return HomeCategorySectionModel.findOne({ key: SECTION_KEY }).lean().exec();
}

export async function replaceHomeCategorySection(categoryIds: string[]) {
  await connectToDatabase();

  return HomeCategorySectionModel.findOneAndUpdate(
    { key: SECTION_KEY },
    {
      $set: {
        categoryIds: categoryIds.map((categoryId) =>
          new Types.ObjectId(categoryId),
        ),
      },
      $setOnInsert: { key: SECTION_KEY },
    },
    { new: true, upsert: true, runValidators: true },
  )
    .lean()
    .exec();
}
