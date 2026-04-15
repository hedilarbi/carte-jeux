import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { assertObjectId } from "@/lib/utils/object-id";
import {
  createPaginatedResult,
  resolvePagination,
} from "@/lib/utils/pagination";
import { serializeDocument } from "@/lib/utils/serialization";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "@/lib/validation/category";
import {
  countProductsByCategoryId,
} from "@/repositories/product.repository";
import {
  createCategory,
  deleteCategoryById,
  existsCategorySlug,
  getCategoryById,
  listCategories,
  type CategoryListFilters,
  updateCategoryById,
} from "@/repositories/category.repository";
import type { Category } from "@/types/entities";

async function resolveCategorySlug(source: string, excludeId?: string) {
  const candidate = generateSlug(source);

  if (!candidate) {
    throw new AppError("Unable to generate a valid category slug.", 400);
  }

  return generateUniqueSlug(candidate, (slug) =>
    existsCategorySlug(slug, excludeId),
  );
}

export const categoryService = {
  async list(filters: CategoryListFilters = {}) {
    const result = await listCategories(filters);
    const pagination = resolvePagination(filters);

    return createPaginatedResult<Category>(
      serializeDocument<Category[]>(result.items),
      result.totalItems,
      pagination,
    );
  },

  async getById(id: string) {
    assertObjectId(id, "Category id");

    const category = await getCategoryById(id);

    if (!category) {
      throw new AppError("Category not found.", 404);
    }

    return serializeDocument<Category>(category);
  },

  async create(input: z.input<typeof categoryCreateSchema>) {
    const parsed = categoryCreateSchema.parse(input);
    const slug = await resolveCategorySlug(parsed.slug ?? parsed.name);
    const created = await createCategory({
      ...parsed,
      slug,
    });

    return serializeDocument<Category>(created);
  },

  async update(id: string, input: z.input<typeof categoryUpdateSchema>) {
    assertObjectId(id, "Category id");

    const existing = await getCategoryById(id);

    if (!existing) {
      throw new AppError("Category not found.", 404);
    }

    const parsed = categoryUpdateSchema.parse(input);
    const slug = parsed.slug
      ? await resolveCategorySlug(parsed.slug, id)
      : undefined;

    const updated = await updateCategoryById(id, {
      ...parsed,
      slug,
    });

    if (!updated) {
      throw new AppError("Category not found.", 404);
    }

    return serializeDocument<Category>(updated);
  },

  async delete(id: string) {
    assertObjectId(id, "Category id");

    const linkedProducts = await countProductsByCategoryId(id);

    if (linkedProducts > 0) {
      throw new AppError(
        "This category is attached to existing products and cannot be deleted.",
        409,
      );
    }

    const deleted = await deleteCategoryById(id);

    if (!deleted) {
      throw new AppError("Category not found.", 404);
    }

    return {
      success: true,
    };
  },
};
