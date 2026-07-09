import {
  type HydratedDocument,
  model,
  models,
  Schema,
  type Types,
} from "mongoose";

export type G2AStockSyncStatus = "idle" | "running" | "failed";

export interface G2AStockSyncStateRecord {
  provider: "g2a";
  status: G2AStockSyncStatus;
  cursorProductId?: Types.ObjectId;
  batchSize: number;
  runCount: number;
  scannedCount: number;
  updatedCount: number;
  priceUpdatedCount: number;
  activatedCount: number;
  deactivatedCount: number;
  unavailableCount: number;
  errorCount: number;
  lastError?: string;
  lastStartedAt?: Date;
  lastFinishedAt?: Date;
  lastWrappedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type G2AStockSyncStateDocument =
  HydratedDocument<G2AStockSyncStateRecord>;

const g2aStockSyncStateSchema = new Schema<G2AStockSyncStateRecord>(
  {
    provider: {
      type: String,
      enum: ["g2a"],
      required: true,
      default: "g2a",
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["idle", "running", "failed"],
      required: true,
      default: "idle",
      index: true,
    },
    cursorProductId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      index: true,
    },
    batchSize: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 100,
    },
    runCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    scannedCount: {
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
    priceUpdatedCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    activatedCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    deactivatedCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unavailableCount: {
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
    lastError: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    lastStartedAt: {
      type: Date,
    },
    lastFinishedAt: {
      type: Date,
    },
    lastWrappedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const G2AStockSyncStateModel =
  models.G2AStockSyncState ||
  model<G2AStockSyncStateRecord>(
    "G2AStockSyncState",
    g2aStockSyncStateSchema,
  );
