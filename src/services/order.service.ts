import { z } from "zod";
import { randomBytes } from "crypto";
import { Types } from "mongoose";

import { AppError } from "@/lib/utils/app-error";
import { assertObjectId } from "@/lib/utils/object-id";
import {
  createPaginatedResult,
  resolvePagination,
} from "@/lib/utils/pagination";
import {
  registerPayment as registerClicToPayPayment,
  verifyPayment as verifyClicToPayPayment,
} from "@/lib/payment/clictopay";
import { roundMoney } from "@/lib/utils/pricing";
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
  getOrderByPaymentTransactionId,
  listOrders,
  type OrderListFilters,
  updateOrderById,
} from "@/repositories/order.repository";
import { listProductsByIds } from "@/repositories/product.repository";
import { emailService } from "@/services/email.service";
import { promoCodeService } from "@/services/promo-code.service";
import { userService } from "@/services/user.service";
import type { Order, Product } from "@/types/entities";

function generateOrderNumber() {
  return `GZ-${Date.now().toString(36).toUpperCase()}${randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;
}

async function attachOrderItemSuppliers(order: Order): Promise<Order> {
  const productIds = [
    ...new Set(
      order.items
        .filter((item) => !item.supplier && item.productId)
        .map((item) => item.productId as string),
    ),
  ];
  const products =
    productIds.length > 0
      ? serializeDocument<Product[]>(await listProductsByIds(productIds))
      : [];
  const supplierByProductId = new Map(
    products.map((product) => [product._id, product.supplier]),
  );

  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      supplier:
        item.supplier ??
        (item.productId ? supplierByProductId.get(item.productId) : undefined) ??
        "internal",
    })),
  };
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

    return attachOrderItemSuppliers(serializeDocument<Order>(order));
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
    paymentProvider: "whatsapp" | "stripe" | "clictopay";
    sessionId: string;
    userId?: string;
    gclid?: string;
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
    const cartItems = (cart.items as CartItemRecord[]).map((item) => ({
      ...item,
      unitPrice: roundMoney(item.unitPrice),
      finalUnitPrice: roundMoney(item.finalUnitPrice),
      lineTotal: roundMoney(roundMoney(item.finalUnitPrice) * item.quantity),
    }));
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
        supplier: item.supplier,
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
      gclid: input.gclid,
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

  /**
   * Enregistre la commande auprès de ClicToPay et renvoie l'URL du formulaire
   * de paiement. L'identifiant de transaction est persisté pour permettre la
   * vérification au retour du client.
   */
  async startClicToPayPayment(input: {
    orderId: string;
    returnUrl: string;
    failUrl?: string;
  }) {
    assertObjectId(input.orderId, "Identifiant de commande");

    const order = await getOrderById(input.orderId);

    if (!order) {
      throw new AppError("Commande introuvable.", 404);
    }

    if (order.paymentStatus !== "pending") {
      throw new AppError("Cette commande n'est plus en attente de paiement.", 409);
    }

    if (order.total <= 0) {
      throw new AppError("Le montant à payer est invalide.", 422);
    }

    const registration = await registerClicToPayPayment({
      amount: order.total,
      currency: order.currency,
      customerEmail: order.customerEmail,
      description: `Commande ${order.orderNumber}`,
      failUrl: input.failUrl,
      orderNumber: order.orderNumber,
      returnUrl: input.returnUrl,
    });

    await updateOrderById(input.orderId, {
      paymentProvider: "clictopay",
      paymentTransactionId: registration.orderId,
    });

    return {
      formUrl: registration.formUrl,
      transactionId: registration.orderId,
    };
  },

  /**
   * Interroge ClicToPay au retour du client et applique le résultat à la
   * commande. L'opération est idempotente : une commande déjà réglée ou déjà
   * échouée n'est pas remise à jour.
   */
  async confirmClicToPayPayment(transactionId: string) {
    const normalizedTransactionId = transactionId.trim();

    if (!normalizedTransactionId) {
      throw new AppError("Identifiant de transaction manquant.", 400);
    }

    const order = await getOrderByPaymentTransactionId(normalizedTransactionId);

    if (!order) {
      throw new AppError("Commande introuvable.", 404);
    }

    if (order.paymentStatus !== "pending") {
      return {
        alreadyProcessed: true,
        order: serializeDocument<Order>(order),
        paymentStatus: order.paymentStatus,
      };
    }

    const verification = await verifyClicToPayPayment({
      transactionId: normalizedTransactionId,
    });

    // Résumé lisible du verdict, succès comme échec : la réponse brute de la
    // passerelle est déjà tracée, mais elle est trop volumineuse pour être
    // exploitable d'un coup d'oeil.
    if (verification.isPaid) {
      console.log(
        `[clictopay] Paiement confirmé pour ${order.orderNumber} ` +
          `(orderStatus=${verification.orderStatus}, ` +
          `${verification.amount} ${order.currency}, transaction ${normalizedTransactionId})`,
      );
    } else {
      // Le libellé brut de la passerelle est en anglais : on le garde côté
      // serveur pour le support, le client ne voit que la version traduite.
      console.warn(
        `[clictopay] Paiement non abouti pour ${order.orderNumber} ` +
          `(orderStatus=${verification.orderStatus}, actionCode=${verification.actionCode ?? "?"}): ` +
          `${verification.rawDescription ?? "sans motif"}`,
      );
    }

    const updated = await updateOrderById(String(order._id),
      verification.isPaid
        ? {
            paidAt: new Date(),
            paymentStatus: "paid",
            status: "paid",
          }
        : {
            paymentStatus: "failed",
            status: "failed",
          },
    );

    if (!updated) {
      throw new AppError("Commande introuvable.", 404);
    }

    return {
      alreadyProcessed: false,
      failureReason: verification.failureReason,
      order: serializeDocument<Order>(updated),
      paymentStatus: verification.isPaid
        ? ("paid" as const)
        : ("failed" as const),
    };
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

    if (
      existing.paymentStatus !== "paid" &&
      parsed.paymentStatus === "paid" &&
      updated.gclid &&
      process.env.GOOGLE_ADS_WEBHOOK_URL
    ) {
      try {
        await fetch(process.env.GOOGLE_ADS_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gclid: updated.gclid,
            value: updated.total,
            currency: updated.currency,
            transaction_id: updated.orderNumber,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (webhookError) {
        console.error("Erreur lors de l'appel au webhook Google Ads:", webhookError);
      }
    }

    return attachOrderItemSuppliers(serializeDocument<Order>(updated));
  },
};
