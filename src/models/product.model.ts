import {
  type HydratedDocument,
  type Model,
  model,
  Schema,
  type Types,
} from "mongoose";

import { calculateDiscountedPrice, roundMoney } from "@/lib/utils/pricing";
import type {
  DeliveryMode,
  ProductFaqItem,
  ProductSupplier,
  ProductType,
} from "@/types/entities";

export interface ProductG2ARecord {
  productId: string;
  selectedOfferId?: string;
  buyPrice?: number;
  supplierStock: number;
  currency?: string;
  platform?: string;
  region?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  lastSyncedAt?: Date;
  lastCatalogSyncedAt?: Date;
}

export interface ProductRecord {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  gallery: string[];
  categoryId: Types.ObjectId;
  categoryIds: Types.ObjectId[];
  platformId: Types.ObjectId;
  regionId?: Types.ObjectId;
  regionIds: Types.ObjectId[];
  faceValue: number;
  currency: string;
  price: number;
  discountPercent: number;
  finalPrice: number;
  sku: string;
  productType: ProductType;
  deliveryMode: DeliveryMode;
  supplier: ProductSupplier;
  stock: number;
  autoPricing: boolean;
  g2a?: ProductG2ARecord;
  isFeatured: boolean;
  isActive: boolean;
  faqItems: ProductFaqItem[];
  seoTitle?: string;
  seoDescription?: string;
  indexable: boolean;
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
    categoryIds: {
      type: [Schema.Types.ObjectId],
      ref: "Category",
      default: [],
      index: true,
      validate: {
        validator(value: Types.ObjectId[]) {
          return value.length > 0;
        },
        message: "Au moins une catégorie doit être sélectionnée.",
      },
    },
    platformId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    regionId: {
      type: Schema.Types.ObjectId,
      ref: "Region",
      index: true,
    },
    regionIds: {
      type: [Schema.Types.ObjectId],
      ref: "Region",
      default: [],
      index: true,
      validate: {
        validator(value: Types.ObjectId[]) {
          return value.length > 0;
        },
        message: "Au moins une région doit être sélectionnée.",
      },
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
    supplier: {
      type: String,
      enum: ["internal", "g2a"],
      default: "internal",
      required: true,
      index: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    autoPricing: {
      type: Boolean,
      default: false,
      index: true,
    },
    g2a: {
      type: new Schema<ProductG2ARecord>(
        {
          productId: {
            type: String,
            required: true,
            trim: true,
            index: true,
          },
          selectedOfferId: {
            type: String,
            trim: true,
          },
          buyPrice: {
            type: Number,
            min: 0,
          },
          supplierStock: {
            type: Number,
            required: true,
            min: 0,
          },
          currency: {
            type: String,
            trim: true,
            uppercase: true,
          },
          platform: {
            type: String,
            trim: true,
          },
          region: {
            type: String,
            trim: true,
          },
          developer: {
            type: String,
            trim: true,
          },
          publisher: {
            type: String,
            trim: true,
          },
          releaseDate: {
            type: String,
            trim: true,
          },
          lastSyncedAt: {
            type: Date,
          },
          lastCatalogSyncedAt: {
            type: Date,
          },
        },
        {
          _id: false,
        },
      ),
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
    faqItems: {
      type: [
        new Schema<ProductFaqItem>(
          {
            question: {
              type: String,
              required: true,
              trim: true,
              maxlength: 240,
            },
            answer: {
              type: String,
              required: true,
              trim: true,
              maxlength: 1200,
            },
          },
          {
            _id: false,
          },
        ),
      ],
      default: [],
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
    indexable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index(
  { "g2a.productId": 1 },
  {
    unique: true,
    sparse: true,
  },
);

productSchema.pre("validate", function setFinalPrice() {
  const product = this as ProductRecord;

  if ((!product.categoryIds || product.categoryIds.length === 0) && product.categoryId) {
    product.categoryIds = [product.categoryId];
  }

  if (!product.categoryId && product.categoryIds?.[0]) {
    product.categoryId = product.categoryIds[0];
  }

  if ((!product.regionIds || product.regionIds.length === 0) && product.regionId) {
    product.regionIds = [product.regionId];
  }

  if (!product.regionId && product.regionIds?.[0]) {
    product.regionId = product.regionIds[0];
  }

  product.price = roundMoney(product.price);
  product.finalPrice = calculateDiscountedPrice(
    product.price,
    product.discountPercent,
  );
});

export const ProductModel = model<ProductRecord>(
  "Product",
  productSchema,
  undefined,
  { overwriteModels: true },
) as Model<ProductRecord>;
