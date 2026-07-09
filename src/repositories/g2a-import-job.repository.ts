import { Types, type mongo } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import {
  G2AImportJobModel,
  type G2AImportJobErrorRecord,
  type G2AImportJobRecord,
} from "@/models/g2a-import-job.model";

type G2AImportJobQuery = mongo.Filter<G2AImportJobRecord>;

export async function createG2AImportJob(
  payload: Partial<G2AImportJobRecord>,
) {
  await connectToDatabase();
  return G2AImportJobModel.create(payload);
}

export async function listG2AImportJobs(limit = 20) {
  await connectToDatabase();
  return G2AImportJobModel.find({})
    .sort({ createdAt: -1 })
    .limit(Math.max(1, Math.min(Math.floor(limit), 100)))
    .lean()
    .exec();
}

export async function getG2AImportJobById(id: string) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  return G2AImportJobModel.findById(id).lean().exec();
}

export async function updateG2AImportJobById(
  id: string,
  payload: Partial<G2AImportJobRecord>,
) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  return G2AImportJobModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();
}

export async function updateG2AImportJobProgress(
  id: string,
  input: {
    page: number;
    nextPage: number;
    scannedProductOffers: number;
    scannedProductIds: number;
    scannedProductDetails: number;
    createdCount: number;
    updatedCount: number;
    skippedCount: number;
    errorCount: number;
    taxonomyCreatedCategoriesCount: number;
    taxonomyCreatedPlatformsCount: number;
  },
) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  return G2AImportJobModel.findByIdAndUpdate(
    id,
    {
      $set: {
        currentPage: input.nextPage,
        lastProcessedPage: input.page,
        lastError: undefined,
      },
      $inc: {
        processedPages: 1,
        scannedProductOffers: input.scannedProductOffers,
        scannedProductIds: input.scannedProductIds,
        scannedProductDetails: input.scannedProductDetails,
        createdCount: input.createdCount,
        updatedCount: input.updatedCount,
        skippedCount: input.skippedCount,
        errorCount: input.errorCount,
        taxonomyCreatedCategoriesCount: input.taxonomyCreatedCategoriesCount,
        taxonomyCreatedPlatformsCount: input.taxonomyCreatedPlatformsCount,
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

export async function appendG2AImportJobError(
  id: string,
  error: G2AImportJobErrorRecord,
) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  return G2AImportJobModel.findByIdAndUpdate(
    id,
    {
      $set: {
        lastError: error.message,
      },
      $inc: {
        errorCount: 1,
      },
      $push: {
        recentErrors: {
          $each: [error],
          $slice: -20,
        },
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

export async function updateG2AImportJobs(
  query: G2AImportJobQuery,
  payload: Partial<G2AImportJobRecord>,
) {
  await connectToDatabase();
  return G2AImportJobModel.updateMany(query, payload).exec();
}
