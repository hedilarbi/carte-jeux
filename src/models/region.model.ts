import { type HydratedDocument, model, models, Schema } from "mongoose";

export interface RegionRecord {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export type RegionDocument = HydratedDocument<RegionRecord>;

const regionSchema = new Schema<RegionRecord>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 12,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 600,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
});

export const RegionModel =
  models.Region || model<RegionRecord>("Region", regionSchema);
