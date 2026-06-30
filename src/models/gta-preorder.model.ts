import {
  type HydratedDocument,
  model,
  type Model,
  models,
  Schema,
} from "mongoose";

export interface GtaPreorderRecord {
  product: "gta-vi";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export type GtaPreorderDocument = HydratedDocument<GtaPreorderRecord>;

const gtaPreorderSchema = new Schema<GtaPreorderRecord>(
  {
    product: {
      type: String,
      enum: ["gta-vi"],
      required: true,
      default: "gta-vi",
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 180,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
  },
  {
    timestamps: true,
  },
);

gtaPreorderSchema.index({ createdAt: -1 });

export const GtaPreorderModel =
  (models.GtaPreorder as Model<GtaPreorderRecord> | undefined) ??
  model<GtaPreorderRecord>("GtaPreorder", gtaPreorderSchema);
