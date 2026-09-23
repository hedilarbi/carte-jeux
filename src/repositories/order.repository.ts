import { connectToDatabase } from "@/lib/db/mongoose";
import { resolvePagination } from "@/lib/utils/pagination";
import {
  OrderModel,
  type OrderItemG2APurchaseRecord,
  type OrderItemRecord,
  type OrderRecord,
} from "@/models/order.model";
import type { SearchablePaginationInput } from "@/types/common";
import type { OrderStatus, PaymentStatus } from "@/types/entities";
import { Types, type mongo } from "mongoose";

type OrderQuery = mongo.Filter<OrderRecord>;

export interface OrderListFilters extends SearchablePaginationInput {
  customerEmail?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentStatuses?: PaymentStatus[];
  promoCodeId?: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listOrders(filters: OrderListFilters = {}) {
  await connectToDatabase();

  const pagination = resolvePagination(filters);
  const query: OrderQuery = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  if (filters.paymentStatuses?.length) {
    query.paymentStatus = { $in: filters.paymentStatuses };
  }

  if (filters.promoCodeId) {
    (query as Record<string, unknown>)["appliedPromoCode.promoCodeId"] =
      new Types.ObjectId(filters.promoCodeId);
  }

  if (filters.customerEmail?.trim()) {
    query.customerEmail = new RegExp(
      `^${escapeRegExp(filters.customerEmail.trim())}$`,
      "i",
    );
  }

  if (filters.search?.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [
      { orderNumber: searchRegex },
      { customerFirstName: searchRegex },
      { customerLastName: searchRegex },
      { customerEmail: searchRegex },
      { customerPhone: searchRegex },
      { supplierPurchaseReference: searchRegex },
      { paymentReference: searchRegex },
    ];
  }

  const [items, totalItems] = await Promise.all([
    OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean()
      .exec(),
    OrderModel.countDocuments(query),
  ]);

  return {
    items,
    totalItems,
    ...pagination,
  };
}

export async function sumPaidOrderTotalsByPromoCodeId(promoCodeId: string) {
  await connectToDatabase();

  const [result] = await OrderModel.aggregate<{ total: number }>([
    {
      $match: {
        "appliedPromoCode.promoCodeId": new Types.ObjectId(promoCodeId),
        paymentStatus: "paid",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
      },
    },
  ]);

  return result?.total ?? 0;
}

export async function createOrder(payload: Partial<OrderRecord>) {
  await connectToDatabase();
  return OrderModel.create(payload);
}

export async function countOrders() {
  await connectToDatabase();
  return OrderModel.countDocuments();
}

export async function countPendingOrders() {
  await connectToDatabase();
  return OrderModel.countDocuments({ status: "pending" });
}

export async function getOrderById(id: string) {
  await connectToDatabase();
  return OrderModel.findById(id).lean().exec();
}

export async function getOrderByOrderNumber(orderNumber: string) {
  await connectToDatabase();
  return OrderModel.findOne({ orderNumber: orderNumber.trim() }).lean().exec();
}

export async function getOrderByPaymentTransactionId(transactionId: string) {
  await connectToDatabase();
  return OrderModel.findOne({ paymentTransactionId: transactionId.trim() })
    .lean()
    .exec();
}

export async function updateOrderById(id: string, payload: Partial<OrderRecord>) {
  await connectToDatabase();
  return OrderModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();
}

/**
 * Pose le verrou anti double-achat G2A. Retourne `null` si une autre
 * exécution (webhook ou cron) le détient déjà.
 */
export async function acquireG2AFulfillmentLock(id: string) {
  await connectToDatabase();
  return OrderModel.findOneAndUpdate(
    { _id: id, g2aFulfillmentInProgress: { $ne: true } },
    { g2aFulfillmentInProgress: true },
    { new: true },
  )
    .lean()
    .exec();
}

export async function releaseG2AFulfillmentLock(id: string) {
  await connectToDatabase();
  await OrderModel.findByIdAndUpdate(id, {
    g2aFulfillmentInProgress: false,
  }).exec();
}

/**
 * Commandes payées ayant encore des articles G2A à acheter (ou à retenter),
 * pour le cron de relance.
 */
export async function listOrdersAwaitingG2AFulfillment(input: {
  limit: number;
  retryCooldownMs: number;
  maxAttemptsPerUnit: number;
}) {
  await connectToDatabase();

  const cooldownCutoff = new Date(Date.now() - input.retryCooldownMs);

  return OrderModel.find({
    paymentStatus: "paid",
    status: { $in: ["paid", "processing"] },
    g2aFulfillmentInProgress: { $ne: true },
    items: {
      $elemMatch: {
        supplier: "g2a",
        $or: [
          { g2aPurchases: { $exists: false } },
          { "g2aPurchases.status": { $ne: "purchased" } },
        ],
      },
    },
  } as unknown as mongo.Filter<OrderRecord>)
    .sort({ updatedAt: 1 })
    .limit(Math.max(1, Math.min(Math.floor(input.limit), 100)))
    .lean()
    .exec()
    .then((orders) =>
      orders.filter((order) =>
        (order.items as OrderItemRecord[]).some((item) => {
          if (item.supplier !== "g2a") {
            return false;
          }

          const purchases: OrderItemG2APurchaseRecord[] = item.g2aPurchases ?? [];
          const purchasedCount = purchases.filter(
            (purchase) => purchase.status === "purchased",
          ).length;

          if (purchasedCount >= item.quantity) {
            return false;
          }

          const pendingOrRetryable = purchases
            .filter((purchase) => purchase.status !== "purchased")
            .every(
              (purchase) =>
                purchase.attempts < input.maxAttemptsPerUnit &&
                (!purchase.lastAttemptAt ||
                  purchase.lastAttemptAt.getTime() < cooldownCutoff.getTime()),
            );

          return purchases.length === 0 || pendingOrRetryable;
        }),
      ),
    );
}
