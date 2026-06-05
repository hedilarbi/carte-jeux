import { z } from "zod";

import { optionalString } from "@/lib/validation/common";

const requiredText = (maxLength: number, message: string) =>
  z.string().trim().min(1, message).max(maxLength);

export const contactSubmissionCreateSchema = z.object({
  platform: requiredText(120, "Sélectionnez une plateforme."),
  requestType: requiredText(120, "Sélectionnez un type de demande."),
  productName: z
    .string()
    .trim()
    .min(2, "Indiquez le produit recherché.")
    .max(200),
  region: requiredText(120, "Sélectionnez une région."),
  budget: requiredText(120, "Sélectionnez un budget."),
  payment: requiredText(120, "Sélectionnez un mode de paiement."),
  email: z
    .string()
    .trim()
    .email("Adresse e-mail invalide.")
    .max(180)
    .transform((value) => value.toLowerCase()),
  phone: optionalString(60),
});

export const contactSubmissionReplySchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "La réponse doit contenir au moins 10 caractères.")
    .max(4000, "La réponse ne peut pas dépasser 4000 caractères."),
});
