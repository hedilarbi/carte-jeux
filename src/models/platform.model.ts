import { type HydratedDocument, model, models, Schema } from "mongoose";

export interface PlatformRecord {
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PlatformDocument = HydratedDocument<PlatformRecord>;

const platformSchema = new Schema<PlatformRecord>(
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
    logo: {
      type: String,
      trim: true,
      maxlength: 500,
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

export const PlatformModel =
  models.Platform || model<PlatformRecord>("Platform", platformSchema);
