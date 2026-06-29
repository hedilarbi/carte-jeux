import {
  type HydratedDocument,
  model,
  models,
  Schema,
  type Types,
} from "mongoose";

export interface BestSellerRecord {
  productId: Types.ObjectId;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type BestSellerDocument = HydratedDocument<BestSellerRecord>;

const bestSellerSchema = new Schema<BestSellerRecord>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const BestSellerModel =
  models.BestSeller || model<BestSellerRecord>("BestSeller", bestSellerSchema);
