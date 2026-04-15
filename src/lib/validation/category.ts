import { z } from "zod";

import {
  booleanDefaultTrueSchema,
  booleanSchema,
  createUpdateSchema,
  optionalSlugSchema,
  optionalString,
} from "@/lib/validation/common";

const categoryCreateShape = {
  name: z.string().trim().min(2).max(120),
  slug: optionalSlugSchema,
  description: optionalString(600),
  isActive: booleanDefaultTrueSchema,
};

const categoryUpdateShape = {
  name: z.string().trim().min(2).max(120),
  slug: optionalSlugSchema,
  description: optionalString(600),
  isActive: booleanSchema.optional(),
};

export const categoryCreateSchema = z.object(categoryCreateShape);
export const categoryUpdateSchema = createUpdateSchema(categoryUpdateShape);
