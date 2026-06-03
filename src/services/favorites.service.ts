import { Types } from "mongoose";
import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { serializeDocument } from "@/lib/utils/serialization";
import { favoriteProductReferenceSchema } from "@/lib/validation/favorites";
import type {
  FavoriteItemRecord,
  FavoriteListRecord,
} from "@/models/favorite-list.model";
import { listCategories } from "@/repositories/category.repository";
import {
  createFavoriteList,
  deleteFavoriteListById,
  getFavoriteListBySessionId,
  getFavoriteListByUserId,
  updateFavoriteListById,
} from "@/repositories/favorite-list.repository";
import {
  getProductById,
  getProductBySlug,
} from "@/repositories/product.repository";
import type { Category, FavoriteList, Product } from "@/types/entities";

export type FavoriteOwner = {
  sessionId?: string;
  userId?: string;
};

function createEmptyFavoriteList(owner: FavoriteOwner): Partial<FavoriteListRecord> {
  return {
    ...(owner.sessionId ? { sessionId: owner.sessionId } : {}),
    ...(owner.userId ? { userId: new Types.ObjectId(owner.userId) } : {}),
    items: [],
  };
}

function createEmptyFavoriteResponse(owner: FavoriteOwner): FavoriteList {
  const now = new Date().toISOString();

  return {
    _id: "empty",
    ...(owner.sessionId ? { sessionId: owner.sessionId } : {}),
    ...(owner.userId ? { userId: owner.userId } : {}),
    items: [],
    createdAt: now,
    updatedAt: now,
  };
}

async function getFavoriteList(owner: FavoriteOwner) {
  if (owner.userId) {
    const userList = await getFavoriteListByUserId(owner.userId);

    if (userList) {
      return serializeDocument<FavoriteListRecord>(userList);
    }
  }

  if (owner.sessionId) {
    const sessionList = await getFavoriteListBySessionId(owner.sessionId);

    if (sessionList) {
      return serializeDocument<FavoriteListRecord>(sessionList);
    }
  }

  return null;
}

async function getOrCreateFavoriteList(owner: FavoriteOwner) {
  const existingList = await getFavoriteList(owner);

  if (existingList) {
    return existingList;
  }

  const createdList = await createFavoriteList(createEmptyFavoriteList(owner));
  return serializeDocument<FavoriteListRecord>(createdList);
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

async function createFavoriteItem(product: Product): Promise<FavoriteItemRecord> {
  const platform = await resolveProductPlatform(product);

  return {
    productId: new Types.ObjectId(product._id),
    productTitle: product.title,
    productSlug: product.slug,
    productImage: product.image,
    platformName: platform.platformName,
    platformImage: platform.platformImage,
    sku: product.sku,
    price: product.finalPrice,
    currency: product.currency,
  };
}

function findFavoriteIndex(
  favoriteList: FavoriteListRecord,
  productReference: string,
) {
  return favoriteList.items.findIndex(
    (item) =>
      item.productSlug === productReference ||
      item.productId.toString() === productReference,
  );
}

async function persistFavoriteList(favoriteList: FavoriteListRecord) {
  if (!favoriteList._id) {
    throw new AppError("Liste de favoris introuvable.", 404);
  }

  const updatedList = await updateFavoriteListById(String(favoriteList._id), {
    items: favoriteList.items,
  });

  if (!updatedList) {
    throw new AppError("Liste de favoris introuvable.", 404);
  }

  return serializeDocument<FavoriteList>(updatedList);
}

export const favoritesService = {
  async get(owner: FavoriteOwner) {
    const favoriteList = await getFavoriteList(owner);

    if (!favoriteList) {
      return createEmptyFavoriteResponse(owner);
    }

    return serializeDocument<FavoriteList>(favoriteList);
  },

  async add(
    owner: FavoriteOwner,
    input: z.input<typeof favoriteProductReferenceSchema>,
  ) {
    const parsed = favoriteProductReferenceSchema.parse(input);
    const product = await resolveProduct(parsed);
    const favoriteList = await getOrCreateFavoriteList(owner);
    const existingIndex = findFavoriteIndex(favoriteList, product._id);

    if (existingIndex < 0) {
      favoriteList.items.unshift(await createFavoriteItem(product));
    }

    return persistFavoriteList(favoriteList);
  },

  async remove(owner: FavoriteOwner, productReference: string) {
    const favoriteList = await getFavoriteList(owner);

    if (!favoriteList) {
      return createEmptyFavoriteResponse(owner);
    }

    const itemIndex = findFavoriteIndex(favoriteList, productReference);

    if (itemIndex >= 0) {
      favoriteList.items.splice(itemIndex, 1);
      return persistFavoriteList(favoriteList);
    }

    return serializeDocument<FavoriteList>(favoriteList);
  },

  async attachSessionToUser(sessionId: string, userId: string) {
    const [sessionList, userList] = await Promise.all([
      getFavoriteListBySessionId(sessionId),
      getFavoriteListByUserId(userId),
    ]);

    if (!sessionList) {
      return userList ? serializeDocument<FavoriteList>(userList) : null;
    }

    if (!userList) {
      const updatedList = await updateFavoriteListById(String(sessionList._id), {
        userId: new Types.ObjectId(userId),
      });

      return updatedList ? serializeDocument<FavoriteList>(updatedList) : null;
    }

    const serializedSessionList =
      serializeDocument<FavoriteListRecord>(sessionList);
    const serializedUserList = serializeDocument<FavoriteListRecord>(userList);
    const existingRefs = new Set(
      serializedUserList.items.map((item) => item.productId.toString()),
    );

    serializedUserList.items = [
      ...serializedSessionList.items.filter((item) => {
        const ref = item.productId.toString();

        if (existingRefs.has(ref)) {
          return false;
        }

        existingRefs.add(ref);
        return true;
      }),
      ...serializedUserList.items,
    ];

    const updatedList = await updateFavoriteListById(
      String(serializedUserList._id),
      { items: serializedUserList.items },
    );
    await deleteFavoriteListById(String(serializedSessionList._id));

    return updatedList ? serializeDocument<FavoriteList>(updatedList) : null;
  },
};
