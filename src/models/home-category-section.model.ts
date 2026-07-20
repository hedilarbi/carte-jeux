import {
  type HydratedDocument,
  model,
  models,
  Schema,
  type Types,
} from "mongoose";

export interface HomeCategorySectionRecord {
  key: "home-categories";
  categoryIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type HomeCategorySectionDocument =
  HydratedDocument<HomeCategorySectionRecord>;

const homeCategorySectionSchema = new Schema<HomeCategorySectionRecord>(
  {
    key: {
      type: String,
      default: "home-categories",
      unique: true,
      immutable: true,
    },
    categoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  { timestamps: true },
);

export const HomeCategorySectionModel =
  models.HomeCategorySection ||
  model<HomeCategorySectionRecord>(
    "HomeCategorySection",
    homeCategorySectionSchema,
  );
