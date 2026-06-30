import {
  type HydratedDocument,
  model,
  models,
  Schema,
  type Types,
} from "mongoose";

import type { PromoCodeDiscountType } from "@/types/entities";

export type CartStatus = "active" | "converted" | "abandoned";

export interface CartAppliedPromoCodeRecord {
  promoCodeId: Types.ObjectId;
  code: string;
  type: PromoCodeDiscountType;
  value: number;
}

export interface CartItemRecord {
  productId: Types.ObjectId;
  productTitle: string;
  productSlug: string;
  productImage?: string;
  platformName?: string;
  platformImage?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  finalUnitPrice: number;
  lineTotal: number;
  currency: string;
}

export interface CartRecord {
  _id?: Types.ObjectId | string;
  sessionId: string;
  userId?: Types.ObjectId;
  status: CartStatus;
  items: CartItemRecord[];
  subtotal: number;
  totalDiscount: number;
  promoDiscountAmount: number;
  total: number;
  currency: string;
  appliedPromoCode?: CartAppliedPromoCodeRecord | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CartDocument = HydratedDocument<CartRecord>;

const cartItemSchema = new Schema<CartItemRecord>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    productTitle: {
      type: String,
      required: true,
      trim: true,
    },
    productSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    productImage: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    platformName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    platformImage: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    finalUnitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
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
  },
  {
    _id: false,
  },
);

const cartAppliedPromoCodeSchema = new Schema<CartAppliedPromoCodeRecord>(
  {
    promoCodeId: {
      type: Schema.Types.ObjectId,
      ref: "PromoCode",
      required: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const cartSchema = new Schema<CartRecord>(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "converted", "abandoned"],
      required: true,
      default: "active",
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    promoDiscountAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
      default: "TND",
    },
    appliedPromoCode: {
      type: cartAppliedPromoCodeSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

cartSchema.index(
  { sessionId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
  },
);

export const CartModel = models.Cart || model<CartRecord>("Cart", cartSchema);
