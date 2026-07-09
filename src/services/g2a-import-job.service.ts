import { AppError } from "@/lib/utils/app-error";
import { assertObjectId } from "@/lib/utils/object-id";
import { serializeDocument } from "@/lib/utils/serialization";
import {
  appendG2AImportJobError,
  createG2AImportJob,
  getG2AImportJobById,
  listG2AImportJobs,
  updateG2AImportJobById,
  updateG2AImportJobProgress,
} from "@/repositories/g2a-import-job.repository";
import { g2aProductImportService } from "@/services/g2a-product-import.service";
import type { G2AImportJob } from "@/types/entities";

const DEFAULT_IMPORT_START_PAGE = 1;
const DEFAULT_IMPORT_ITEMS_PER_PAGE = 100;
const DEFAULT_IMPORT_DELAY_MS = 250;
const MAX_IMPORT_DELAY_MS = 30000;
const MAX_PAGE_RETRIES = 3;

declare global {
  var __g2aImportJobWorkers: Map<string, Promise<void>> | undefined;
}

const activeWorkers = global.__g2aImportJobWorkers ?? new Map<string, Promise<void>>();
global.__g2aImportJobWorkers = activeWorkers;

interface StartG2AImportJobInput {
  startPage?: number;
  itemsPerPage?: number;
  maxPages?: number;
  syncTaxonomies?: boolean;
  delayMs?: number;
  requestedByEmail?: string;
}

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number,
) {
  return Number.isFinite(value) && value && value > 0
    ? Math.floor(value)
    : fallback;
}

function normalizeItemsPerPage(value: number | undefined) {
  const normalizedValue = normalizePositiveInteger(
    value,
    DEFAULT_IMPORT_ITEMS_PER_PAGE,
  );

  return [10, 20, 50, 100].includes(normalizedValue)
    ? normalizedValue
    : DEFAULT_IMPORT_ITEMS_PER_PAGE;
}

function normalizeMaxPages(value: number | undefined) {
  return Number.isFinite(value) && value && value > 0
    ? Math.floor(value)
    : undefined;
}

function normalizeDelayMs(value: number | undefined) {
  const normalizedValue = normalizePositiveInteger(
    value,
    DEFAULT_IMPORT_DELAY_MS,
  );

  return Math.min(normalizedValue, MAX_IMPORT_DELAY_MS);
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function serializeJob(job: unknown) {
  return serializeDocument<G2AImportJob>(job);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Erreur inconnue.";
}

function getErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  if ("details" in error) {
    return (error as { details?: unknown }).details;
  }

  return undefined;
}

async function importPageWithRetries(input: {
  delayMs: number;
  itemsPerPage: number;
  page: number;
  syncTaxonomies: boolean;
}) {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_PAGE_RETRIES; attempt += 1) {
    try {
      return await g2aProductImportService.importProductPageBulk({
        page: input.page,
        itemsPerPage: input.itemsPerPage,
        syncTaxonomies: input.syncTaxonomies,
      });
    } catch (error) {
      lastError = error;

      if (attempt < MAX_PAGE_RETRIES) {
        await sleep(input.delayMs * attempt * 4);
      }
    }
  }

  throw lastError;
}

async function markJobCompleted(jobId: string) {
  return updateG2AImportJobById(jobId, {
    status: "completed",
    finishedAt: new Date(),
  });
}

async function markJobFailed(jobId: string, page: number, error: unknown) {
  await appendG2AImportJobError(jobId, {
    page,
    message: getErrorMessage(error),
    details: getErrorDetails(error),
    occurredAt: new Date(),
  });

  return updateG2AImportJobById(jobId, {
    status: "failed",
    finishedAt: new Date(),
  });
}

async function runImportJob(jobId: string) {
  let job = await getG2AImportJobById(jobId);

  if (!job || job.status === "completed") {
    return;
  }

  if (job.status === "paused") {
    return;
  }

  job = await updateG2AImportJobById(jobId, {
    status: "running",
    startedAt: job.startedAt ?? new Date(),
  });

  while (job) {
    if (job.status === "paused" || job.status === "completed") {
      return;
    }

    if (job.status === "failed") {
      return;
    }

    if (job.maxPages && job.processedPages >= job.maxPages) {
      await markJobCompleted(jobId);
      return;
    }

    const page = job.currentPage;

    try {
      const result = await importPageWithRetries({
        delayMs: job.delayMs,
        itemsPerPage: job.itemsPerPage,
        page,
        syncTaxonomies: job.syncTaxonomies,
      });

      if (result.scanned.productOffers === 0) {
        await markJobCompleted(jobId);
        return;
      }

      job = await updateG2AImportJobProgress(jobId, {
        page,
        nextPage: page + 1,
        scannedProductOffers: result.scanned.productOffers,
        scannedProductIds: result.scanned.productIds,
        scannedProductDetails: result.scanned.productDetails,
        createdCount: result.summary.created,
        updatedCount: result.summary.updated,
        skippedCount: result.summary.skipped,
        errorCount: result.summary.errors,
        taxonomyCreatedCategoriesCount:
          result.taxonomySync?.created.categories.length ?? 0,
        taxonomyCreatedPlatformsCount:
          result.taxonomySync?.created.platforms.length ?? 0,
      });

      if (!job) {
        return;
      }

      if (job.maxPages && job.processedPages >= job.maxPages) {
        await markJobCompleted(jobId);
        return;
      }

      if (job.delayMs > 0) {
        await sleep(job.delayMs);
      }

      job = await getG2AImportJobById(jobId);
    } catch (error) {
      await markJobFailed(jobId, page, error);
      return;
    }
  }
}

function startWorker(jobId: string) {
  if (activeWorkers.has(jobId)) {
    return;
  }

  const worker = runImportJob(jobId).finally(() => {
    activeWorkers.delete(jobId);
  });

  activeWorkers.set(jobId, worker);
  void worker;
}

export const g2aImportJobService = {
  async start(input: StartG2AImportJobInput = {}) {
    const startPage = normalizePositiveInteger(
      input.startPage,
      DEFAULT_IMPORT_START_PAGE,
    );
    const job = await createG2AImportJob({
      status: "queued",
      startPage,
      currentPage: startPage,
      itemsPerPage: normalizeItemsPerPage(input.itemsPerPage),
      maxPages: normalizeMaxPages(input.maxPages),
      syncTaxonomies: input.syncTaxonomies ?? true,
      delayMs: normalizeDelayMs(input.delayMs),
      requestedByEmail: input.requestedByEmail,
    });
    const serializedJob = serializeJob(job);

    startWorker(serializedJob._id);
    return serializedJob;
  },

  async list(limit?: number) {
    return serializeDocument<G2AImportJob[]>(
      await listG2AImportJobs(
        normalizePositiveInteger(limit, 20),
      ),
    );
  },

  async getById(id: string) {
    assertObjectId(id, "Identifiant du job d'import G2A");

    const job = await getG2AImportJobById(id);

    if (!job) {
      throw new AppError("Job d'import G2A introuvable.", 404);
    }

    return serializeJob(job);
  },

  async pause(id: string) {
    assertObjectId(id, "Identifiant du job d'import G2A");

    const job = await getG2AImportJobById(id);

    if (!job) {
      throw new AppError("Job d'import G2A introuvable.", 404);
    }

    if (job.status === "completed") {
      throw new AppError("Ce job est déjà terminé.", 409);
    }

    const updated = await updateG2AImportJobById(id, {
      status: "paused",
      pausedAt: new Date(),
    });

    return serializeJob(updated);
  },

  async resume(id: string) {
    assertObjectId(id, "Identifiant du job d'import G2A");

    const job = await getG2AImportJobById(id);

    if (!job) {
      throw new AppError("Job d'import G2A introuvable.", 404);
    }

    if (job.status === "completed") {
      throw new AppError("Ce job est déjà terminé.", 409);
    }

    const updated = await updateG2AImportJobById(id, {
      status: "queued",
      pausedAt: undefined,
      finishedAt: undefined,
      lastError: undefined,
    });
    const serializedJob = serializeJob(updated);

    startWorker(serializedJob._id);
    return serializedJob;
  },
};
