import {
  type HydratedDocument,
  model,
  models,
  Schema,
  type Types,
} from "mongoose";

import type { OrderStatus, PaymentStatus } from "@/types/entities";

export interface OrderItemRecord {
  productId?: Types.ObjectId;
  productTitle: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  finalUnitPrice: number;
  lineTotal: number;
  currency: string;
}

export interface OrderRecord {
  orderNumber: string;
  userId?: Types.ObjectId;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItemRecord[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  currency: string;
  customerEmail: string;
  supplierPlatform?: string;
  supplierPurchaseReference?: string;
  supplierCost?: number;
  internalNote?: string;
  deliveryMethod: "email";
  deliveredCode?: string;
  deliveryNote?: string;
  deliveredAt?: Date;
  paymentProvider?: string;
  paymentReference?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<OrderRecord>;

const orderItemSchema = new Schema<OrderItemRecord>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    productTitle: {
      type: String,
      required: true,
      trim: true,
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

const orderSchema = new Schema<OrderRecord>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
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
      enum: [
        "pending",
        "paid",
        "processing",
        "purchased",
        "delivered",
        "cancelled",
        "failed",
      ],
      required: true,
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      required: true,
      default: "pending",
      index: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalDiscount: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
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
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    supplierPlatform: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    supplierPurchaseReference: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    supplierCost: {
      type: Number,
      min: 0,
    },
    internalNote: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    deliveryMethod: {
      type: String,
      enum: ["email"],
      required: true,
      default: "email",
    },
    deliveredCode: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
    deliveryNote: {
      type: String,
      trim: true,
      maxlength: 1200,
    },
    deliveredAt: {
      type: Date,
    },
    paymentProvider: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    paymentReference: {
      type: String,
      trim: true,
      maxlength: 180,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const OrderModel = models.Order || model<OrderRecord>("Order", orderSchema);
