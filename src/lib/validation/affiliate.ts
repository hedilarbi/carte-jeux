import { z } from "zod";

import { objectIdSchema } from "@/lib/validation/common";

export const createAffiliateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Le prénom est requis.")
    .max(80, "Le prénom ne peut pas dépasser 80 caractères."),
  lastName: z
    .string()
    .trim()
    .min(1, "Le nom est requis.")
    .max(80, "Le nom ne peut pas dépasser 80 caractères."),
  email: z
    .string()
    .trim()
    .email("L'email est invalide.")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  promoCodeIds: z.array(objectIdSchema).optional().default([]),
});

export const updateAffiliateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Le prénom est requis.")
    .max(80, "Le prénom ne peut pas dépasser 80 caractères."),
  lastName: z
    .string()
    .trim()
    .min(1, "Le nom est requis.")
    .max(80, "Le nom ne peut pas dépasser 80 caractères."),
  email: z
    .string()
    .trim()
    .email("L'email est invalide.")
    .transform((value) => value.toLowerCase()),
  // Vide ou absent : le mot de passe actuel est conservé.
  password: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine(
      (value) => value === undefined || value.length >= 8,
      "Le mot de passe doit contenir au moins 8 caractères.",
    ),
  isActive: z.boolean(),
  // Liste complète des codes attribués après modification.
  promoCodeIds: z.array(objectIdSchema),
});
