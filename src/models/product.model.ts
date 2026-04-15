import {
  type HydratedDocument,
  model,
  models,
  Schema,
  type Types,
} from "mongoose";

import { calculateDiscountedPrice } from "@/lib/utils/pricing";
import type { DeliveryMode, ProductType } from "@/types/entities";

export interface ProductRecord {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  gallery: string[];
  categoryId: Types.ObjectId;
  platformId: Types.ObjectId;
  regionId: Types.ObjectId;
  faceValue: number;
  currency: string;
  price: number;
  discountPercent: number;
  finalPrice: number;
  sku: string;
  productType: ProductType;
  deliveryMode: DeliveryMode;
  isFeatured: boolean;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<ProductRecord>;

const productSchema = new Schema<ProductRecord>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
    image: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    gallery: {
      type: [String],
      default: [],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    platformId: {
      type: Schema.Types.ObjectId,
      ref: "Platform",
      required: true,
      index: true,
    },
    regionId: {
      type: Schema.Types.ObjectId,
      ref: "Region",
      required: true,
      index: true,
    },
    faceValue: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    productType: {
      type: String,
      enum: ["gift_card", "subscription", "game_credit"],
      required: true,
    },
    deliveryMode: {
      type: String,
      enum: ["manual_email"],
      default: "manual_email",
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 320,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.pre("validate", function setFinalPrice(next) {
  this.finalPrice = calculateDiscountedPrice(this.price, this.discountPercent);
  next();
});

export const ProductModel =
  models.Product || model<ProductRecord>("Product", productSchema);
