import { type HydratedDocument, model, models, Schema } from "mongoose";

export interface CategoryRecord {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isPlateforme: boolean;
  isActive: boolean;
  sortOrder: number;
  indexable: boolean;
  seoTitle?: string;
  metaDescription?: string;
  h1?: string;
  intro?: string;
  canonical?: string;
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
    indexable: {
      type: Boolean,
      default: false,
      index: true,
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 320,
    },
    h1: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    intro: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    canonical: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

export const CategoryModel =
  models.Category || model<CategoryRecord>("Category", categorySchema);
