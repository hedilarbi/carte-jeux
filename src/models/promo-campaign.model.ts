import {
  type HydratedDocument,
  model,
  models,
  Schema,
  type Types,
} from "mongoose";

import type { PromoCampaignType } from "@/types/entities";

export interface PromoCampaignRecord {
  name: string;
  type: PromoCampaignType;
  value: number;
  productIds: Types.ObjectId[];
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PromoCampaignDocument = HydratedDocument<PromoCampaignRecord>;

const promoCampaignSchema = new Schema<PromoCampaignRecord>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    type: {
      type: String,
      enum: ["percentage"],
      required: true,
      default: "percentage",
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    productIds: {
      type: [Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const PromoCampaignModel =
  models.PromoCampaign ||
  model<PromoCampaignRecord>("PromoCampaign", promoCampaignSchema);
