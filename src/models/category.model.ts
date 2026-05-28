import { type HydratedDocument, model, models, Schema } from "mongoose";

export interface CategoryRecord {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isPlateforme: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryDocument = HydratedDocument<CategoryRecord>;

const categorySchema = new Schema<CategoryRecord>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 600,
    },
    image: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isPlateforme: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const CategoryModel =
  models.Category || model<CategoryRecord>("Category", categorySchema);
