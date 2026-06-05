import { model, Schema, type HydratedDocument, type Model } from "mongoose";

import type { ContactSubmissionStatus } from "@/types/entities";

export interface ContactSubmissionReplyRecord {
  message: string;
  sentTo: string;
  sentAt: Date;
  adminEmail?: string;
}

export interface ContactSubmissionRecord {
  platform: string;
  requestType: string;
  productName: string;
  region: string;
  budget: string;
  payment: string;
  email: string;
  phone?: string;
  status: ContactSubmissionStatus;
  replies: ContactSubmissionReplyRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export type ContactSubmissionDocument =
  HydratedDocument<ContactSubmissionRecord>;

const contactSubmissionReplySchema =
  new Schema<ContactSubmissionReplyRecord>({
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    sentTo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 180,
    },
    sentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    adminEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 180,
    },
  });

const contactSubmissionSchema = new Schema<ContactSubmissionRecord>(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    requestType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    region: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    budget: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    payment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
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
      trim: true,
      maxlength: 60,
    },
    status: {
      type: String,
      enum: ["new", "replied"],
      required: true,
      default: "new",
      index: true,
    },
    replies: {
      type: [contactSubmissionReplySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

contactSubmissionSchema.index({ createdAt: -1 });

export const ContactSubmissionModel = model<ContactSubmissionRecord>(
  "ContactSubmission",
  contactSubmissionSchema,
  undefined,
  { overwriteModels: true },
) as Model<ContactSubmissionRecord>;
