import { calculateDiscountedPrice, roundMoney } from "@/lib/utils/pricing";
import { serializeDocument } from "@/lib/utils/serialization";
import type { ProductRecord } from "@/models/product.model";
import {
  acquireG2AStockSyncState,
  completeG2AStockSyncState,
  failG2AStockSyncState,
  getG2AStockSyncState,
} from "@/repositories/g2a-stock-sync-state.repository";
import {
  bulkWriteProducts,
  listG2AProductsForStockSync,
} from "@/repositories/product.repository";
import {
  chooseCheapestAvailableOffer,
  fetchG2AProductOffersByProductIds,
  type G2AOffer,
  type G2AProductOffer,
} from "@/services/g2a-export.service";

const DEFAULT_BATCH_SIZE = 100;
const PRICE_MULTIPLIER = 4;

type UnknownRecord = Record<string, unknown>;

function normalizeBatchSize(value: number | undefined) {
  return Number.isFinite(value) && value && value > 0
    ? Math.min(Math.floor(value), DEFAULT_BATCH_SIZE)
    : DEFAULT_BATCH_SIZE;
}

function toFiniteNumber(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function getStringLikeField(record: UnknownRecord, field: string) {
  const value = record[field];

  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function getNestedStringLikeField(
  record: UnknownRecord,
  nestedField: string,
  field: string,
) {
  const nested = record[nestedField];

  if (!nested || typeof nested !== "object" || Array.isArray(nested)) {
    return undefined;
  }

  return getStringLikeField(nested as UnknownRecord, field);
}

function getG2AProductId(productOffer: G2AProductOffer) {
  const record = productOffer as UnknownRecord;

  return (
    getStringLikeField(record, "productId") ??
    getStringLikeField(record, "id") ??
    getNestedStringLikeField(record, "product", "id") ??
    getNestedStringLikeField(record, "product", "productId")
  );
}

function getG2AOfferId(offer: G2AOffer | null) {
  if (!offer) {
    return undefined;
  }

  const record = offer as UnknownRecord;

  return (
    getStringLikeField(record, "id") ??
    getStringLikeField(record, "offerId") ??
    getStringLikeField(record, "sellerOfferId")
  );
}

async function listNextProductBatch(input: {
  batchSize: number;
  cursorProductId?: string;
}) {
  let wrapped = false;
  let products = await listG2AProductsForStockSync({
    afterId: input.cursorProductId,
    limit: input.batchSize,
  });

  if (products.length === 0 && input.cursorProductId) {
    wrapped = true;
    products = await listG2AProductsForStockSync({
      limit: input.batchSize,
    });
  }

  return {
    products: serializeDocument<Array<ProductRecord & { _id: string }>>(products),
    wrapped,
  };
}

function buildOfferMap(productOffers: G2AProductOffer[]) {
  return new Map(
    productOffers
      .map((productOffer) => [getG2AProductId(productOffer), productOffer] as const)
      .filter((item): item is [string, G2AProductOffer] => Boolean(item[0])),
  );
}

export const g2aStockSyncService = {
  async getState() {
    return getG2AStockSyncState();
  },

  async runNextBatch(input: { batchSize?: number } = {}) {
    const batchSize = normalizeBatchSize(input.batchSize);
    const state = await acquireG2AStockSyncState(batchSize);

    if (!state) {
      return {
        skipped: true,
        reason: "already_running",
        state: await getG2AStockSyncState(),
      };
    }

    try {
      const cursorProductId = state.cursorProductId
        ? String(state.cursorProductId)
        : undefined;
      const { products, wrapped } = await listNextProductBatch({
        batchSize,
        cursorProductId,
      });

      if (products.length === 0) {
        const nextState = await completeG2AStockSyncState({
          batchSize,
          wrapped,
          scannedCount: 0,
          updatedCount: 0,
          priceUpdatedCount: 0,
          activatedCount: 0,
          deactivatedCount: 0,
          unavailableCount: 0,
        });

        return {
          skipped: false,
          reason: "no_g2a_products",
          batch: {
            size: 0,
            wrapped,
          },
          state: nextState,
        };
      }

      const productIds = products
        .map((product) => product.g2a?.productId)
        .filter((productId): productId is string => Boolean(productId));
      const productOffers = await fetchG2AProductOffersByProductIds(productIds);
      const offersByProductId = buildOfferMap(productOffers);
      const now = new Date();
      const operations: Parameters<typeof bulkWriteProducts>[0] = [];
      let priceUpdatedCount = 0;
      let activatedCount = 0;
      let deactivatedCount = 0;
      let unavailableCount = 0;

      products.forEach((product) => {
        const productId = product.g2a?.productId;
        const productOffer = productId
          ? offersByProductId.get(productId)
          : undefined;
        const selectedOffer = chooseCheapestAvailableOffer(
          productOffer?.offers ?? [],
        );
        const buyPrice = toFiniteNumber(selectedOffer?.price);
        const supplierStock = toFiniteNumber(selectedOffer?.quantity) ?? 0;
        const isAvailable =
          Boolean(selectedOffer) && supplierStock > 0 && buyPrice !== undefined;
        const nextIsActive = isAvailable;
        const setPayload: Partial<ProductRecord> = {
          stock: supplierStock,
          isActive: nextIsActive,
          g2a: {
            ...(product.g2a ?? {}),
            productId: productId ?? "",
            selectedOfferId: getG2AOfferId(selectedOffer),
            buyPrice,
            supplierStock,
            currency: selectedOffer?.currency ?? product.g2a?.currency,
            lastSyncedAt: now,
          },
        };

        if (product.autoPricing !== false && buyPrice !== undefined) {
          const price = roundMoney(buyPrice * PRICE_MULTIPLIER);

          setPayload.faceValue = price;
          setPayload.price = price;
          setPayload.finalPrice = calculateDiscountedPrice(
            price,
            product.discountPercent,
          );
          priceUpdatedCount += 1;
        }

        if (nextIsActive && !product.isActive) {
          activatedCount += 1;
        }

        if (!nextIsActive && product.isActive) {
          deactivatedCount += 1;
        }

        if (!nextIsActive) {
          unavailableCount += 1;
        }

        operations.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: setPayload,
            },
          },
        });
      });

      await bulkWriteProducts(operations);

      const lastProduct = products[products.length - 1];
      const reachedEnd = products.length < batchSize;
      const nextCursorProductId = reachedEnd ? undefined : lastProduct._id;
      const nextState = await completeG2AStockSyncState({
        cursorProductId: nextCursorProductId,
        batchSize,
        wrapped: wrapped || reachedEnd,
        scannedCount: products.length,
        updatedCount: operations.length,
        priceUpdatedCount,
        activatedCount,
        deactivatedCount,
        unavailableCount,
      });

      return {
        skipped: false,
        batch: {
          size: products.length,
          cursorProductId,
          nextCursorProductId,
          wrapped: wrapped || reachedEnd,
        },
        summary: {
          updated: operations.length,
          priceUpdated: priceUpdatedCount,
          activated: activatedCount,
          deactivated: deactivatedCount,
          unavailable: unavailableCount,
        },
        state: nextState,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Synchronisation G2A échouée.";
      const failedState = await failG2AStockSyncState(message);

      throw Object.assign(error instanceof Error ? error : new Error(message), {
        details: {
          state: failedState,
        },
      });
    }
  },
};
