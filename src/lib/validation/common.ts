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
  .regex(/^[a-f\d]{24}$/i, "Identifiant invalide.");

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Le slug doit contenir au moins 2 caractères.")
  .max(160, "Le slug doit contenir au maximum 160 caractères.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le format du slug est invalide.");

export const currencySchema = z
  .string()
  .trim()
  .length(3, "La devise doit être un code à 3 lettres.")
  .transform((value) => value.toUpperCase());

export const optionalString = (maxLength: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(maxLength).optional());

export const optionalUrlSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().url("URL invalide.").optional(),
);

export const optionalSlugSchema = z.preprocess(
  emptyToUndefined,
  slugSchema.optional(),
);

export const booleanSchema = z.boolean();
export const booleanDefaultTrueSchema = z.boolean().optional().default(true);

export const percentageSchema = z
  .number()
  .min(0, "Le pourcentage ne peut pas être négatif.")
  .max(100, "Le pourcentage ne peut pas dépasser 100.");

export const nonNegativeNumberSchema = z
  .number()
  .min(0, "La valeur ne peut pas être négative.");

export function createUpdateSchema<T extends z.ZodRawShape>(shape: T) {
  return z
    .object(shape)
    .partial()
    .refine(
      (value) =>
        Object.values(value).some(
          (entry) => entry !== undefined && entry !== null,
        ),
      "Au moins un champ doit être renseigné.",
    );
}
