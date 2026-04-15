import { z } from "zod";

import {
  booleanDefaultTrueSchema,
  booleanSchema,
  createUpdateSchema,
  optionalSlugSchema,
  optionalUrlSchema,
} from "@/lib/validation/common";

const platformCreateShape = {
  name: z.string().trim().min(2).max(120),
  slug: optionalSlugSchema,
  logo: optionalUrlSchema,
  isActive: booleanDefaultTrueSchema,
};

const platformUpdateShape = {
  name: z.string().trim().min(2).max(120),
  slug: optionalSlugSchema,
  logo: optionalUrlSchema,
  isActive: booleanSchema.optional(),
};

export const platformCreateSchema = z.object(platformCreateShape);
export const platformUpdateSchema = createUpdateSchema(platformUpdateShape);
