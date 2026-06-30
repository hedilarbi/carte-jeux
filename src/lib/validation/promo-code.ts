import { z } from "zod";

import { createUpdateSchema } from "@/lib/validation/common";

const emptyToUndefined = (value: unknown) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const numberFromInput = (value: unknown) => {
  const normalized = emptyToUndefined(value);

  if (typeof normalized === "string") {
    return Number(normalized);
  }

  return normalized;
};

const promoCodeValueSchema = z.preprocess(
  numberFromInput,
  z.number().positive("La valeur de réduction doit être supérieure à 0."),
);

const optionalUsageLimitSchema = z.preprocess(
  numberFromInput,
  z
    .number()
    .int("La limite d'utilisation doit être un nombre entier.")
    .min(1, "La limite d'utilisation doit être supérieure à 0.")
    .optional(),
);

const promoCodeCreateShape = {
  code: z
    .string()
    .trim()
    .min(2, "Le code promo doit contenir au moins 2 caractères.")
    .max(40, "Le code promo ne peut pas dépasser 40 caractères.")
    .regex(
      /^[A-Z0-9][A-Z0-9_-]*$/i,
      "Le code promo peut contenir des lettres, chiffres, tirets et underscores.",
    )
    .transform((value) => value.toUpperCase()),
  type: z.enum(["percentage", "fixed"], {
    error: "Le type de réduction est invalide.",
  }),
  value: promoCodeValueSchema,
  expiresAt: z.coerce.date({
    error: "La date d'expiration est invalide.",
  }),
  usageLimit: optionalUsageLimitSchema,
  usageLimitPerUser: optionalUsageLimitSchema,
};

export const promoCodeCreateSchema = z.object(promoCodeCreateShape);
export const promoCodeUpdateSchema = createUpdateSchema(promoCodeCreateShape);

export const applyPromoCodeSchema = z.object({
  code: promoCodeCreateShape.code,
});
