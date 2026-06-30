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
import { emailService } from "@/services/email.service";
import { promoCodeService } from "@/services/promo-code.service";
import { userService } from "@/services/user.service";
import type { Order } from "@/types/entities";

function generateOrderNumber() {
  return `GZ-${Date.now().toString(36).toUpperCase()}${randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;
}

function roundMoney(value: number) {
  return Math.round(value * 1000) / 1000;
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
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string;
    guestCustomer?: {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
    paymentProvider: "whatsapp";
    sessionId: string;
    userId?: string;
  }) {
    const cart = await getActiveCartBySessionId(input.sessionId);

    if (!cart || cart.items.length === 0) {
      throw new AppError("Votre panier est vide.", 409);
    }

    const guestUser =
      input.userId || !input.guestCustomer
        ? null
        : await userService.ensureGuestForOrder(input.guestCustomer);
    const orderUserId = input.userId ?? guestUser?._id;
    const cartItems = cart.items as CartItemRecord[];
    const subtotal = roundMoney(
      cartItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      ),
    );
    const totalBeforePromo = roundMoney(
      cartItems.reduce(
        (sum, item) => sum + item.finalUnitPrice * item.quantity,
        0,
      ),
    );

    if (cart.appliedPromoCode && !orderUserId) {
      throw new AppError(
        "Un utilisateur est requis pour utiliser ce code promo.",
        409,
      );
    }

    const appliedPromoCode = cart.appliedPromoCode
      ? await promoCodeService.redeemForOrder({
          amount: totalBeforePromo,
          code: cart.appliedPromoCode.code,
          promoCodeId: String(cart.appliedPromoCode.promoCodeId),
          userId: String(orderUserId),
        })
      : null;
    const total = appliedPromoCode?.discountedTotal ?? totalBeforePromo;

    const order = await createOrder({
      orderNumber: generateOrderNumber(),
      userId: orderUserId ? new Types.ObjectId(orderUserId) : undefined,
      status: "pending",
      paymentStatus: "pending",
      items: cartItems.map((item: CartItemRecord) => ({
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
      subtotal,
      totalDiscount: roundMoney(Math.max(0, subtotal - total)),
      total,
      currency: cart.currency,
      appliedPromoCode: appliedPromoCode
        ? {
            ...appliedPromoCode,
            promoCodeId: new Types.ObjectId(appliedPromoCode.promoCodeId),
          }
        : null,
      customerFirstName: input.customerFirstName,
      customerLastName: input.customerLastName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      deliveryMethod: "email",
      paymentProvider: input.paymentProvider,
      paymentReference: `${input.paymentProvider.toUpperCase()}-${randomBytes(4)
        .toString("hex")
        .toUpperCase()}`,
    });

    await updateCartById(String(cart._id), {
      status: "converted",
    });

    const serializedOrder = serializeDocument<Order>(order);

    try {
      await emailService.sendOrderConfirmation({ order: serializedOrder });
    } catch (error) {
      console.error(
        `Impossible d'envoyer le récapitulatif de la commande ${serializedOrder.orderNumber}.`,
        error,
      );
    }

    return serializedOrder;
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
