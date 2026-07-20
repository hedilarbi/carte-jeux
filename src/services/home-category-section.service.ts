import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { serializeDocument } from "@/lib/utils/serialization";
import { homeCategorySectionUpdateSchema } from "@/lib/validation/home-category-section";
import {
  countCategoriesByIds,
  listCategoriesByIds,
} from "@/repositories/category.repository";
import {
  getHomeCategorySection,
  replaceHomeCategorySection,
} from "@/repositories/home-category-section.repository";
import type { Category } from "@/types/entities";

async function getSelectedCategories(options: { activeOnly?: boolean } = {}) {
  const section = await getHomeCategorySection();

  if (!section) {
    return { categories: [], isConfigured: false };
  }

  const categoryIds: string[] = section.categoryIds
    .slice(0, 16)
    .map((categoryId: unknown) => String(categoryId));
  const categories = serializeDocument<Category[]>(
    await listCategoriesByIds(categoryIds, {
      isActive: options.activeOnly ? true : undefined,
    }),
  );
  const categoryMap = new Map(
    categories.map((category) => [category._id, category]),
  );

  return {
    categories: categoryIds
      .map((categoryId) => categoryMap.get(categoryId))
      .filter((category): category is Category => Boolean(category)),
    isConfigured: true,
  };
}

export const homeCategorySectionService = {
  list: getSelectedCategories,

  async update(input: z.input<typeof homeCategorySectionUpdateSchema>) {
    const parsed = homeCategorySectionUpdateSchema.parse(input);

    if (parsed.categoryIds.length > 0) {
      const existingCount = await countCategoriesByIds(parsed.categoryIds);

      if (existingCount !== parsed.categoryIds.length) {
        throw new AppError(
          "La section contient une catégorie invalide.",
          400,
        );
      }
    }

    await replaceHomeCategorySection(parsed.categoryIds);
    return getSelectedCategories();
  },
};
