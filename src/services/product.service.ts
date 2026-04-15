import { Types } from "mongoose";
import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { assertObjectId } from "@/lib/utils/object-id";
import {
  createPaginatedResult,
  resolvePagination,
} from "@/lib/utils/pagination";
import { calculateDiscountedPrice } from "@/lib/utils/pricing";
import { serializeDocument } from "@/lib/utils/serialization";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug";
import {
  productCreateSchema,
  productUpdateSchema,
} from "@/lib/validation/product";
import { getCategoryById } from "@/repositories/category.repository";
import { getPlatformById } from "@/repositories/platform.repository";
import {
  createProduct,
  deleteProductById,
  existsProductSku,
  existsProductSlug,
  getProductById,
  listProducts,
  type ProductListFilters,
  updateProductById,
} from "@/repositories/product.repository";
import { getRegionById } from "@/repositories/region.repository";
import type { Product } from "@/types/entities";

async function ensureProductRelations(input: {
  categoryId?: string;
  platformId?: string;
  regionId?: string;
}) {
  const checks = await Promise.all([
    input.categoryId ? getCategoryById(input.categoryId) : Promise.resolve(true),
    input.platformId ? getPlatformById(input.platformId) : Promise.resolve(true),
    input.regionId ? getRegionById(input.regionId) : Promise.resolve(true),
  ]);

  if (!checks[0]) {
    throw new AppError("La référence de catégorie est invalide.", 400);
  }

  if (!checks[1]) {
    throw new AppError("La référence de plateforme est invalide.", 400);
  }

  if (!checks[2]) {
    throw new AppError("La référence de région est invalide.", 400);
  }
}

async function resolveProductSlug(source: string, excludeId?: string) {
  const candidate = generateSlug(source);

  if (!candidate) {
    throw new AppError("Impossible de générer un slug de produit valide.", 400);
  }

  return generateUniqueSlug(candidate, (slug) =>
    existsProductSlug(slug, excludeId),
  );
}

function normalizeGallery(gallery: string[] | undefined) {
  return [...new Set((gallery ?? []).map((item) => item.trim()).filter(Boolean))];
}

function toObjectId(value: string) {
  return new Types.ObjectId(value);
}

export const productService = {
  async list(filters: ProductListFilters = {}) {
    const result = await listProducts(filters);
    const pagination = resolvePagination(filters);

    return createPaginatedResult<Product>(
      serializeDocument<Product[]>(result.items),
      result.totalItems,
      pagination,
    );
  },

  async getById(id: string) {
    assertObjectId(id, "Identifiant de produit");

    const product = await getProductById(id);

    if (!product) {
      throw new AppError("Produit introuvable.", 404);
    }

    return serializeDocument<Product>(product);
  },

  async create(input: z.input<typeof productCreateSchema>) {
    const parsed = productCreateSchema.parse(input);
    await ensureProductRelations(parsed);

    const normalizedSku = parsed.sku.toUpperCase();

    if (await existsProductSku(normalizedSku)) {
      throw new AppError("Le SKU produit existe déjà.", 409);
    }

    const slug = await resolveProductSlug(parsed.slug ?? parsed.title);
    const created = await createProduct({
      ...parsed,
      gallery: normalizeGallery(parsed.gallery),
      categoryId: toObjectId(parsed.categoryId),
      platformId: toObjectId(parsed.platformId),
      regionId: toObjectId(parsed.regionId),
      slug,
      sku: normalizedSku,
      finalPrice: calculateDiscountedPrice(parsed.price, parsed.discountPercent),
    });

    return serializeDocument<Product>(created);
  },

  async update(id: string, input: z.input<typeof productUpdateSchema>) {
    assertObjectId(id, "Identifiant de produit");

    const existing = await getProductById(id);

    if (!existing) {
      throw new AppError("Produit introuvable.", 404);
    }

    const parsed = productUpdateSchema.parse(input);
    await ensureProductRelations(parsed);

    const normalizedSku = parsed.sku?.toUpperCase();

    if (normalizedSku && (await existsProductSku(normalizedSku, id))) {
      throw new AppError("Le SKU produit existe déjà.", 409);
    }

    const price = parsed.price ?? existing.price;
    const discountPercent = parsed.discountPercent ?? existing.discountPercent;
    const slug = parsed.slug
      ? await resolveProductSlug(parsed.slug, id)
      : undefined;

    const updated = await updateProductById(id, {
      ...parsed,
      ...(parsed.gallery ? { gallery: normalizeGallery(parsed.gallery) } : {}),
      ...(parsed.categoryId ? { categoryId: toObjectId(parsed.categoryId) } : {}),
      ...(parsed.platformId ? { platformId: toObjectId(parsed.platformId) } : {}),
      ...(parsed.regionId ? { regionId: toObjectId(parsed.regionId) } : {}),
      ...(slug ? { slug } : {}),
      ...(normalizedSku ? { sku: normalizedSku } : {}),
      finalPrice: calculateDiscountedPrice(price, discountPercent),
    });

    if (!updated) {
      throw new AppError("Produit introuvable.", 404);
    }

    return serializeDocument<Product>(updated);
  },

  async delete(id: string) {
    assertObjectId(id, "Identifiant de produit");

    const deleted = await deleteProductById(id);

    if (!deleted) {
      throw new AppError("Produit introuvable.", 404);
    }

    return {
      success: true,
    };
  },
};
