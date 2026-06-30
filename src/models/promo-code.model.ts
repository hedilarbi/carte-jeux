import {
  type HydratedDocument,
  model,
  models,
  Schema,
} from "mongoose";

import type { PromoCodeDiscountType } from "@/types/entities";

export interface PromoCodeRecord {
  code: string;
  type: PromoCodeDiscountType;
  value: number;
  expiresAt: Date;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
  usedByUserIds: Map<string, number> | Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export type PromoCodeDocument = HydratedDocument<PromoCodeRecord>;

const promoCodeSchema = new Schema<PromoCodeRecord>(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
      minlength: 2,
      maxlength: 40,
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
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    usageLimitPerUser: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    usedByUserIds: {
      type: Map,
      of: Number,
      default: {},
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

promoCodeSchema.index({ code: 1 }, { unique: true });

export const PromoCodeModel =
  models.PromoCode || model<PromoCodeRecord>("PromoCode", promoCodeSchema);
