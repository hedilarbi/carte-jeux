import { Types } from "mongoose";
import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { roundMoney } from "@/lib/utils/pricing";
import { serializeDocument } from "@/lib/utils/serialization";
import {
  addCartItemSchema,
  updateCartItemSchema,
} from "@/lib/validation/cart";
import { applyPromoCodeSchema } from "@/lib/validation/promo-code";
import type { CartItemRecord, CartRecord } from "@/models/cart.model";
import {
  createCart,
  deleteCartBySessionId,
  getActiveCartBySessionId,
  updateCartById,
} from "@/repositories/cart.repository";
import { listCategories } from "@/repositories/category.repository";
import {
  getProductById,
  getProductBySlug,
} from "@/repositories/product.repository";
import {
  calculatePromoCodeDiscount,
  promoCodeService,
} from "@/services/promo-code.service";
import type { Cart, Category, Product } from "@/types/entities";

function createEmptyCart(sessionId: string): Partial<CartRecord> {
  return {
    sessionId,
    status: "active",
    items: [],
    subtotal: 0,
    totalDiscount: 0,
    promoDiscountAmount: 0,
    total: 0,
    currency: "TND",
    appliedPromoCode: null,
  };
}

function calculateCartTotals(cart: {
  appliedPromoCode?: CartRecord["appliedPromoCode"];
  items: CartItemRecord[];
}) {
  const subtotal = roundMoney(
    cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );
  const totalBeforePromo = roundMoney(
    cart.items.reduce(
      (sum, item) => sum + item.finalUnitPrice * item.quantity,
      0,
    ),
  );
  const promoDiscountAmount = cart.appliedPromoCode
    ? calculatePromoCodeDiscount({
        amount: totalBeforePromo,
        type: cart.appliedPromoCode.type,
        value: cart.appliedPromoCode.value,
      })
    : 0;
  const total = roundMoney(
    Math.max(0, totalBeforePromo - promoDiscountAmount),
  );

  return {
    subtotal,
    totalDiscount: roundMoney(Math.max(0, subtotal - total)),
    promoDiscountAmount,
    total,
    currency: cart.items[0]?.currency ?? "TND",
  };
}

function normalizeCartPayload(cart: CartRecord): Partial<CartRecord> {
  const items = cart.items.map((item) => ({
    ...item,
    unitPrice: roundMoney(item.unitPrice),
    finalUnitPrice: roundMoney(item.finalUnitPrice),
    lineTotal: roundMoney(roundMoney(item.finalUnitPrice) * item.quantity),
  }));
  const appliedPromoCode = items.length > 0 ? cart.appliedPromoCode ?? null : null;
  const totals = calculateCartTotals({
    appliedPromoCode,
    items,
  });

  return {
    appliedPromoCode,
    items,
    ...totals,
  };
}

async function getOrCreateCartRecord(sessionId: string) {
  const existingCart = await getActiveCartBySessionId(sessionId);

  if (existingCart) {
    return serializeDocument<CartRecord>(existingCart);
  }

  const createdCart = await createCart(createEmptyCart(sessionId));
  return serializeDocument<CartRecord>(createdCart);
}

async function resolveProduct(input: { productId?: string; slug?: string }) {
  const product =
    input.productId && Types.ObjectId.isValid(input.productId)
      ? await getProductById(input.productId)
      : input.slug
        ? await getProductBySlug(input.slug)
        : undefined;

  if (!product) {
    throw new AppError("Produit introuvable.", 404);
  }

  const serializedProduct = serializeDocument<Product>(product);

  if (!serializedProduct.isActive) {
    throw new AppError("Ce produit n'est pas disponible.", 409);
  }

  return serializedProduct;
}

async function resolveProductPlatform(product: Product) {
  const categoryResult = await listCategories({
    page: 1,
    limit: 100,
    isActive: true,
  });
  const categories = serializeDocument<Category[]>(categoryResult.items);
  const categoryMap = new Map(
    categories.map((category) => [category._id, category]),
  );
  const platform =
    product.categoryIds
      .map((categoryId) => categoryMap.get(categoryId))
      .find((category) => category?.isPlateforme) ??
    categoryMap.get(product.platformId);

  return {
    platformImage: platform?.image,
    platformName: platform?.name,
  };
}

async function createCartItem(
  product: Product,
  quantity: number,
): Promise<CartItemRecord> {
  const platform = await resolveProductPlatform(product);

  return {
    productId: new Types.ObjectId(product._id),
    productTitle: product.title,
    productSlug: product.slug,
    productImage: product.image,
    platformName: platform.platformName,
    platformImage: platform.platformImage,
    sku: product.sku,
    quantity,
    unitPrice: roundMoney(product.price),
    discountPercent: product.discountPercent,
    finalUnitPrice: roundMoney(product.finalPrice),
    lineTotal: roundMoney(roundMoney(product.finalPrice) * quantity),
    currency: product.currency,
  };
}

function findCartItemIndex(cart: CartRecord, productReference: string) {
  return cart.items.findIndex(
    (item) =>
      item.productSlug === productReference ||
      item.productId.toString() === productReference,
  );
}

async function persistCart(cart: CartRecord) {
  if (!cart._id) {
    throw new AppError("Panier introuvable.", 404);
  }

  const payload = normalizeCartPayload(cart);
  const updatedCart = await updateCartById(String(cart._id), payload);

  if (!updatedCart) {
    throw new AppError("Panier introuvable.", 404);
  }

  return serializeDocument<Cart>(updatedCart);
}

export const cartService = {
  async getCart(sessionId: string) {
    const cart = await getOrCreateCartRecord(sessionId);
    return serializeDocument<Cart>({
      ...cart,
      ...normalizeCartPayload(cart),
    });
  },

  async applyPromoCode(
    sessionId: string,
    input: z.input<typeof applyPromoCodeSchema>,
    userId?: string,
  ) {
    const cart = await getOrCreateCartRecord(sessionId);

    if (cart.items.length === 0) {
      throw new AppError("Votre panier est vide.", 409);
    }

    const appliedPromoCode = await promoCodeService.getApplicableByCode(
      input,
      userId,
    );

    cart.appliedPromoCode = {
      promoCodeId: new Types.ObjectId(appliedPromoCode.promoCodeId),
      code: appliedPromoCode.code,
      type: appliedPromoCode.type,
      value: appliedPromoCode.value,
    };

    return persistCart(cart);
  },

  async removePromoCode(sessionId: string) {
    const cart = await getOrCreateCartRecord(sessionId);

    cart.appliedPromoCode = null;

    return persistCart(cart);
  },

  async addItem(
    sessionId: string,
    input: z.input<typeof addCartItemSchema>,
  ) {
    const parsed = addCartItemSchema.parse(input);
    const product = await resolveProduct(parsed);
    const cart = await getOrCreateCartRecord(sessionId);
    const existingItemIndex = findCartItemIndex(cart, product._id);

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity = Math.min(
        99,
        cart.items[existingItemIndex].quantity + parsed.quantity,
      );
      cart.items[existingItemIndex].unitPrice = roundMoney(product.price);
      cart.items[existingItemIndex].discountPercent = product.discountPercent;
      cart.items[existingItemIndex].finalUnitPrice = roundMoney(product.finalPrice);
      cart.items[existingItemIndex].lineTotal = roundMoney(
        roundMoney(product.finalPrice) * cart.items[existingItemIndex].quantity,
      );
    } else {
      cart.items.push(await createCartItem(product, parsed.quantity));
    }

    return persistCart(cart);
  },

  async updateItem(
    sessionId: string,
    productReference: string,
    input: z.input<typeof updateCartItemSchema>,
  ) {
    const parsed = updateCartItemSchema.parse(input);
    const cart = await getOrCreateCartRecord(sessionId);
    const itemIndex = findCartItemIndex(cart, productReference);

    if (itemIndex < 0) {
      throw new AppError("Produit introuvable dans le panier.", 404);
    }

    if (parsed.quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = parsed.quantity;
      cart.items[itemIndex].finalUnitPrice = roundMoney(
        cart.items[itemIndex].finalUnitPrice,
      );
      cart.items[itemIndex].unitPrice = roundMoney(cart.items[itemIndex].unitPrice);
      cart.items[itemIndex].lineTotal = roundMoney(
        cart.items[itemIndex].finalUnitPrice * parsed.quantity,
      );
    }

    return persistCart(cart);
  },

  async removeItem(sessionId: string, productReference: string) {
    const cart = await getOrCreateCartRecord(sessionId);
    const itemIndex = findCartItemIndex(cart, productReference);

    if (itemIndex < 0) {
      throw new AppError("Produit introuvable dans le panier.", 404);
    }

    cart.items.splice(itemIndex, 1);
    return persistCart(cart);
  },

  async clear(sessionId: string) {
    await deleteCartBySessionId(sessionId);
    const cart = await createCart(createEmptyCart(sessionId));
    return serializeDocument<Cart>(cart);
  },
};
