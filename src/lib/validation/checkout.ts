import { z } from "zod";

export const checkoutCreateSchema = z.object({
  customerEmail: z
    .string()
    .trim()
    .email("Une adresse e-mail valide est requise.")
    .transform((value) => value.toLowerCase()),
  paymentMethod: z.literal("floussi", {
    error: "Le moyen de paiement sélectionné est invalide.",
  }),
});
