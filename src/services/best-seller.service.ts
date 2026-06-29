import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { serializeDocument } from "@/lib/utils/serialization";
import { bestSellerUpdateSchema } from "@/lib/validation/best-seller";
import {
  listBestSellerItems,
  replaceBestSellerItems,
} from "@/repositories/best-seller.repository";
import {
  countProductsByIds,
  listProductsByIds,
} from "@/repositories/product.repository";
import type { BestSellerItem, Product } from "@/types/entities";

async function hydrateBestSellerItems(options: { activeOnly?: boolean } = {}) {
  const items = serializeDocument<BestSellerItem[]>(await listBestSellerItems());
  const products = serializeDocument<Product[]>(
    await listProductsByIds(
      items.map((item) => String(item.productId)),
      options.activeOnly ? { isActive: true } : {},
    ),
  );
  const productMap = new Map(products.map((product) => [product._id, product]));

  return items
    .map((item) => ({
      ...item,
      productId: String(item.productId),
      product: productMap.get(String(item.productId)),
    }))
    .filter((item) => Boolean(item.product));
}

export const bestSellerService = {
  async list(options: { activeOnly?: boolean } = {}) {
    return hydrateBestSellerItems(options);
  },

  async update(input: z.input<typeof bestSellerUpdateSchema>) {
    const parsed = bestSellerUpdateSchema.parse(input);

    if (parsed.productIds.length > 0) {
      const existingProductsCount = await countProductsByIds(parsed.productIds);

      if (existingProductsCount !== parsed.productIds.length) {
        throw new AppError(
          "La liste best seller contient un produit invalide.",
          400,
        );
      }
    }

    await replaceBestSellerItems(parsed.productIds);

    return hydrateBestSellerItems();
  },
};
