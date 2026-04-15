import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { assertObjectId } from "@/lib/utils/object-id";
import {
  createPaginatedResult,
  resolvePagination,
} from "@/lib/utils/pagination";
import { serializeDocument } from "@/lib/utils/serialization";
import { orderUpdateSchema } from "@/lib/validation/order";
import {
  getOrderById,
  listOrders,
  type OrderListFilters,
  updateOrderById,
} from "@/repositories/order.repository";
import type { Order } from "@/types/entities";

export const orderService = {
  async list(filters: OrderListFilters = {}) {
    const result = await listOrders(filters);
    const pagination = resolvePagination(filters);

    return createPaginatedResult<Order>(
      serializeDocument<Order[]>(result.items),
      result.totalItems,
      pagination,
    );
  },

  async getById(id: string) {
    assertObjectId(id, "Order id");

    const order = await getOrderById(id);

    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    return serializeDocument<Order>(order);
  },

  async update(id: string, input: z.input<typeof orderUpdateSchema>) {
    assertObjectId(id, "Order id");

    const existing = await getOrderById(id);

    if (!existing) {
      throw new AppError("Order not found.", 404);
    }

    const parsed = orderUpdateSchema.parse(input);
    const nextStatus = parsed.status ?? existing.status;
    const deliveredCode = parsed.deliveredCode ?? existing.deliveredCode;

    if (nextStatus === "delivered" && !deliveredCode) {
      throw new AppError(
        "Delivered orders require a delivered code before status can be updated.",
        400,
      );
    }

    const updated = await updateOrderById(id, {
      ...parsed,
      paidAt:
        parsed.paymentStatus === "paid" && !existing.paidAt
          ? new Date()
          : existing.paidAt,
      deliveredAt:
        nextStatus === "delivered"
          ? existing.deliveredAt ?? new Date()
          : existing.deliveredAt,
    });

    if (!updated) {
      throw new AppError("Order not found.", 404);
    }

    return serializeDocument<Order>(updated);
  },
};
