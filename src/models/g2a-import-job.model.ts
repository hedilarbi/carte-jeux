import { type HydratedDocument, model, models, Schema } from "mongoose";

import type { G2AImportJobStatus } from "@/types/entities";

export interface G2AImportJobErrorRecord {
  page?: number;
  message: string;
  details?: unknown;
  occurredAt: Date;
}

export interface G2AImportJobRecord {
  status: G2AImportJobStatus;
  startPage: number;
  currentPage: number;
  lastProcessedPage?: number;
  itemsPerPage: number;
  maxPages?: number;
  processedPages: number;
  scannedProductOffers: number;
  scannedProductIds: number;
  scannedProductDetails: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  taxonomyCreatedCategoriesCount: number;
  taxonomyCreatedPlatformsCount: number;
  syncTaxonomies: boolean;
  delayMs: number;
  lastError?: string;
  recentErrors: G2AImportJobErrorRecord[];
  startedAt?: Date;
  pausedAt?: Date;
  finishedAt?: Date;
  requestedByEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type G2AImportJobDocument = HydratedDocument<G2AImportJobRecord>;

const g2aImportJobErrorSchema = new Schema<G2AImportJobErrorRecord>(
  {
    page: {
      type: Number,
      min: 1,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    occurredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const g2aImportJobSchema = new Schema<G2AImportJobRecord>(
  {
    status: {
      type: String,
      enum: ["queued", "running", "paused", "completed", "failed"],
      required: true,
      default: "queued",
      index: true,
    },
    startPage: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    currentPage: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
      index: true,
    },
    lastProcessedPage: {
      type: Number,
      min: 1,
    },
    itemsPerPage: {
      type: Number,
      required: true,
      enum: [10, 20, 50, 100],
      default: 100,
    },
    maxPages: {
      type: Number,
      min: 1,
    },
    processedPages: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    scannedProductOffers: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    scannedProductIds: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    scannedProductDetails: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    createdCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    updatedCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    skippedCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    errorCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    taxonomyCreatedCategoriesCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    taxonomyCreatedPlatformsCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    syncTaxonomies: {
      type: Boolean,
      required: true,
      default: true,
    },
    delayMs: {
      type: Number,
      required: true,
      min: 0,
      max: 30000,
      default: 250,
    },
    lastError: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    recentErrors: {
      type: [g2aImportJobErrorSchema],
      default: [],
    },
    startedAt: {
      type: Date,
    },
    pausedAt: {
      type: Date,
    },
    finishedAt: {
      type: Date,
    },
    requestedByEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 180,
    },
  },
  {
    timestamps: true,
  },
);

g2aImportJobSchema.index({ status: 1, updatedAt: -1 });

export const G2AImportJobModel =
  models.G2AImportJob ||
  model<G2AImportJobRecord>("G2AImportJob", g2aImportJobSchema);
