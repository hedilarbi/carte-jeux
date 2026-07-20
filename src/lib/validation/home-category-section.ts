import { z } from "zod";

import { objectIdSchema } from "@/lib/validation/common";

export const homeCategorySectionUpdateSchema = z
  .object({
    categoryIds: z
      .array(objectIdSchema)
      .max(16, "La section ne peut contenir que 16 catégories."),
  })
  .refine(
    (value) => new Set(value.categoryIds).size === value.categoryIds.length,
    "Chaque catégorie ne peut apparaître qu'une seule fois.",
  );
