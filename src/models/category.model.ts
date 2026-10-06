import { type HydratedDocument, model, models, Schema } from "mongoose";

export interface CategorySeoSection {
  heading: string;
  // Plain text; internal links use the `[anchor](/path)` syntax.
  paragraphs: string[];
}

export interface CategoryFaqItem {
  question: string;
  answer: string;
}

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
  sections?: CategorySeoSection[];
  faq?: CategoryFaqItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryDocument = HydratedDocument<CategoryRecord>;

const seoSectionSchema = new Schema<CategorySeoSection>(
  {
    heading: { type: String, required: true, trim: true, maxlength: 160 },
    paragraphs: { type: [{ type: String, trim: true, maxlength: 3000 }], default: [] },
  },
  { _id: false },
);

const faqItemSchema = new Schema<CategoryFaqItem>(
  {
    question: { type: String, required: true, trim: true, maxlength: 300 },
    answer: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { _id: false },
);

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
    sections: {
      type: [seoSectionSchema],
      default: undefined,
    },
    faq: {
      type: [faqItemSchema],
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

export const CategoryModel =
  models.Category || model<CategoryRecord>("Category", categorySchema);
