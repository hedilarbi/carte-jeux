import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import {
  G2AStockSyncStateModel,
  type G2AStockSyncStateRecord,
} from "@/models/g2a-stock-sync-state.model";

const PROVIDER = "g2a";
const LOCK_TIMEOUT_MS = 1000 * 60 * 5;

async function ensureG2AStockSyncState(batchSize = 100) {
  await connectToDatabase();

  return G2AStockSyncStateModel.findOneAndUpdate(
    { provider: PROVIDER },
    {
      $setOnInsert: {
        provider: PROVIDER,
        status: "idle",
        batchSize,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  )
    .lean()
    .exec();
}

export async function getG2AStockSyncState() {
  await connectToDatabase();
  return G2AStockSyncStateModel.findOne({ provider: PROVIDER }).lean().exec();
}

export async function acquireG2AStockSyncState(batchSize = 100) {
  await ensureG2AStockSyncState(batchSize);

  const staleBefore = new Date(Date.now() - LOCK_TIMEOUT_MS);

  return G2AStockSyncStateModel.findOneAndUpdate(
    {
      provider: PROVIDER,
      $or: [
        { status: { $ne: "running" } },
        { lastStartedAt: { $lte: staleBefore } },
      ],
    },
    {
      $set: {
        status: "running",
        batchSize,
        lastStartedAt: new Date(),
        lastError: undefined,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec();
}

export async function completeG2AStockSyncState(input: {
  cursorProductId?: string;
  wrapped: boolean;
  batchSize: number;
  scannedCount: number;
  updatedCount: number;
  priceUpdatedCount: number;
  activatedCount: number;
  deactivatedCount: number;
  unavailableCount: number;
}) {
  await connectToDatabase();

  const update: {
    $set: Partial<G2AStockSyncStateRecord>;
    $unset?: { cursorProductId: "" };
    $inc: Partial<Record<keyof G2AStockSyncStateRecord, number>>;
  } = {
    $set: {
      status: "idle",
      batchSize: input.batchSize,
      lastFinishedAt: new Date(),
      ...(input.wrapped ? { lastWrappedAt: new Date() } : {}),
    },
    $inc: {
      runCount: 1,
      scannedCount: input.scannedCount,
      updatedCount: input.updatedCount,
      priceUpdatedCount: input.priceUpdatedCount,
      activatedCount: input.activatedCount,
      deactivatedCount: input.deactivatedCount,
      unavailableCount: input.unavailableCount,
    },
  };

  if (input.cursorProductId && Types.ObjectId.isValid(input.cursorProductId)) {
    update.$set.cursorProductId = new Types.ObjectId(input.cursorProductId);
  } else {
    update.$unset = { cursorProductId: "" };
  }

  return G2AStockSyncStateModel.findOneAndUpdate(
    { provider: PROVIDER },
    update,
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec();
}

export async function failG2AStockSyncState(error: string) {
  await connectToDatabase();

  return G2AStockSyncStateModel.findOneAndUpdate(
    { provider: PROVIDER },
    {
      $set: {
        status: "failed",
        lastError: error,
        lastFinishedAt: new Date(),
      },
      $inc: {
        errorCount: 1,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec();
}
