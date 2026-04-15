import { type FilterQuery } from "mongoose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { resolvePagination } from "@/lib/utils/pagination";
import { OrderModel, type OrderRecord } from "@/models/order.model";
import type { SearchablePaginationInput } from "@/types/common";
import type { OrderStatus, PaymentStatus } from "@/types/entities";

export interface OrderListFilters extends SearchablePaginationInput {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export async function listOrders(filters: OrderListFilters = {}) {
  await connectToDatabase();

  const pagination = resolvePagination(filters);
  const query: FilterQuery<OrderRecord> = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  if (filters.search?.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [
      { orderNumber: searchRegex },
      { customerEmail: searchRegex },
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

export async function updateOrderById(id: string, payload: Partial<OrderRecord>) {
  await connectToDatabase();
  return OrderModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();
}
