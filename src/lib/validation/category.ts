import { z } from "zod";

import {
  booleanDefaultTrueSchema,
  booleanSchema,
  createUpdateSchema,
  objectIdSchema,
  optionalUrlSchema,
  optionalSlugSchema,
  optionalString,
} from "@/lib/validation/common";

const categoryCreateShape = {
  name: z.string().trim().min(2).max(120),
  slug: optionalSlugSchema,
  description: optionalString(600),
  image: optionalUrlSchema,
  isPlateforme: z.boolean().optional().default(false),
  isActive: booleanDefaultTrueSchema,
};

const categoryUpdateShape = {
  name: z.string().trim().min(2).max(120),
  slug: optionalSlugSchema,
  description: optionalString(600),
  image: optionalUrlSchema,
  isPlateforme: booleanSchema.optional(),
  isActive: booleanSchema.optional(),
};

export const categoryCreateSchema = z.object(categoryCreateShape);
export const categoryUpdateSchema = createUpdateSchema(categoryUpdateShape);
export const categoryReorderSchema = z
  .object({
    categoryIds: z
      .array(objectIdSchema)
      .min(1, "Au moins une catégorie doit être renseignée."),
  })
  .refine(
    (value) => new Set(value.categoryIds).size === value.categoryIds.length,
    "Chaque catégorie ne peut apparaître qu'une seule fois.",
  );
