import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid identifier.");

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters.")
  .max(160, "Slug must be at most 160 characters.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug format is invalid.");

export const currencySchema = z
  .string()
  .trim()
  .length(3, "Currency must be a 3-letter code.")
  .transform((value) => value.toUpperCase());

export const optionalString = (maxLength: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(maxLength).optional());

export const optionalUrlSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().url("Invalid URL.").optional(),
);

export const optionalSlugSchema = z.preprocess(
  emptyToUndefined,
  slugSchema.optional(),
);

export const booleanSchema = z.boolean();
export const booleanDefaultTrueSchema = z.boolean().optional().default(true);

export const percentageSchema = z
  .number()
  .min(0, "Percentage cannot be negative.")
  .max(100, "Percentage cannot exceed 100.");

export const nonNegativeNumberSchema = z
  .number()
  .min(0, "Value cannot be negative.");

export function createUpdateSchema<T extends z.ZodRawShape>(shape: T) {
  return z
    .object(shape)
    .partial()
    .refine(
      (value) =>
        Object.values(value).some(
          (entry) => entry !== undefined && entry !== null,
        ),
      "At least one field must be provided.",
    );
}
