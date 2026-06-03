import {
  type HydratedDocument,
  type Model,
  model,
  Schema,
  type Types,
} from "mongoose";

export interface FavoriteItemRecord {
  productId: Types.ObjectId;
  productTitle: string;
  productSlug: string;
  productImage?: string;
  platformName?: string;
  platformImage?: string;
  sku: string;
  price: number;
  currency: string;
}

export interface FavoriteListRecord {
  _id?: Types.ObjectId | string;
  sessionId?: string;
  userId?: Types.ObjectId | string;
  items: FavoriteItemRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export type FavoriteListDocument = HydratedDocument<FavoriteListRecord>;

const favoriteItemSchema = new Schema<FavoriteItemRecord>(
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
    price: {
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

const favoriteListSchema = new Schema<FavoriteListRecord>(
  {
    sessionId: {
      type: String,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    items: {
      type: [favoriteItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

favoriteListSchema.index(
  { sessionId: 1 },
  {
    unique: true,
    partialFilterExpression: { sessionId: { $type: "string" } },
  },
);

favoriteListSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: { userId: { $exists: true } },
  },
);

export const FavoriteListModel = model<FavoriteListRecord>(
  "FavoriteList",
  favoriteListSchema,
  undefined,
  { overwriteModels: true },
) as Model<FavoriteListRecord>;
