import { z } from "zod";
import { randomBytes } from "crypto";
import { Types } from "mongoose";

import { AppError } from "@/lib/utils/app-error";
import { assertObjectId } from "@/lib/utils/object-id";
import {
  createPaginatedResult,
  resolvePagination,
} from "@/lib/utils/pagination";
import { serializeDocument } from "@/lib/utils/serialization";
import { orderUpdateSchema } from "@/lib/validation/order";
import {
  getActiveCartBySessionId,
  updateCartById,
} from "@/repositories/cart.repository";
import type { CartItemRecord } from "@/models/cart.model";
import {
  createOrder,
  getOrderById,
  getOrderByOrderNumber,
  listOrders,
  type OrderListFilters,
  updateOrderById,
} from "@/repositories/order.repository";
import type { Order } from "@/types/entities";

function generateOrderNumber() {
  return `GZ-${Date.now().toString(36).toUpperCase()}${randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;
}

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
    assertObjectId(id, "Identifiant de commande");

    const order = await getOrderById(id);

    if (!order) {
      throw new AppError("Commande introuvable.", 404);
    }

    return serializeDocument<Order>(order);
  },

  async getByOrderNumber(orderNumber: string) {
    const normalizedOrderNumber = orderNumber.trim();

    if (!normalizedOrderNumber) {
      throw new AppError("Numéro de commande invalide.", 400);
    }

    const order = await getOrderByOrderNumber(normalizedOrderNumber);

    if (!order) {
      throw new AppError("Commande introuvable.", 404);
    }

    return serializeDocument<Order>(order);
  },

  async createFromCart(input: {
    customerEmail: string;
    paymentProvider: "floussi";
    sessionId: string;
    userId?: string;
  }) {
    const cart = await getActiveCartBySessionId(input.sessionId);

    if (!cart || cart.items.length === 0) {
      throw new AppError("Votre panier est vide.", 409);
    }

    const order = await createOrder({
      orderNumber: generateOrderNumber(),
      userId: input.userId ? new Types.ObjectId(input.userId) : undefined,
      status: "pending",
      paymentStatus: "pending",
      items: cart.items.map((item: CartItemRecord) => ({
        productId: item.productId,
        productTitle: item.productTitle,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        finalUnitPrice: item.finalUnitPrice,
        lineTotal: item.lineTotal,
        currency: item.currency,
      })),
      subtotal: cart.subtotal,
      totalDiscount: cart.totalDiscount,
      total: cart.total,
      currency: cart.currency,
      customerEmail: input.customerEmail,
      deliveryMethod: "email",
      paymentProvider: input.paymentProvider,
      paymentReference: `FLOUSSI-${randomBytes(4).toString("hex").toUpperCase()}`,
    });

    await updateCartById(String(cart._id), {
      status: "converted",
    });

    return serializeDocument<Order>(order);
  },

  async update(id: string, input: z.input<typeof orderUpdateSchema>) {
    assertObjectId(id, "Identifiant de commande");

    const existing = await getOrderById(id);

    if (!existing) {
      throw new AppError("Commande introuvable.", 404);
    }

    const parsed = orderUpdateSchema.parse(input);
    const nextStatus = parsed.status ?? existing.status;
    const deliveredCode = parsed.deliveredCode ?? existing.deliveredCode;

    if (nextStatus === "delivered" && !deliveredCode) {
      throw new AppError(
        "Une commande livrée doit contenir un code livré avant la mise à jour du statut.",
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
      throw new AppError("Commande introuvable.", 404);
    }

    return serializeDocument<Order>(updated);
  },
};
