import { z } from "zod";

import {
  booleanDefaultTrueSchema,
  booleanSchema,
  createUpdateSchema,
  optionalString,
} from "@/lib/validation/common";

const regionCreateShape = {
  name: z.string().trim().min(2).max(120),
  code: z
    .string()
    .trim()
    .min(2)
    .max(12)
    .transform((value) => value.toUpperCase()),
  description: optionalString(600),
  isActive: booleanDefaultTrueSchema,
};

const regionUpdateShape = {
  name: z.string().trim().min(2).max(120),
  code: z
    .string()
    .trim()
    .min(2)
    .max(12)
    .transform((value) => value.toUpperCase()),
  description: optionalString(600),
  isActive: booleanSchema.optional(),
};

export const regionCreateSchema = z.object(regionCreateShape);
export const regionUpdateSchema = createUpdateSchema(regionUpdateShape);
