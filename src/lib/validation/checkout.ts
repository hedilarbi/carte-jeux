import { z } from "zod";

export const checkoutCreateSchema = z.object({
  customerFirstName: z
    .string()
    .trim()
    .min(1, "Le prénom est requis.")
    .max(80, "Le prénom ne peut pas dépasser 80 caractères."),
  customerLastName: z
    .string()
    .trim()
    .min(1, "Le nom est requis.")
    .max(80, "Le nom ne peut pas dépasser 80 caractères."),
  customerEmail: z
    .string()
    .trim()
    .email("Une adresse e-mail valide est requise.")
    .transform((value) => value.toLowerCase()),
  paymentMethod: z.enum(["whatsapp", "flouci"], {
    error: "Le moyen de paiement sélectionné est invalide.",
  }),
});
