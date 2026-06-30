import { z } from "zod";

import { customerProfileCompletionSchema } from "@/lib/validation/auth";

export const gtaPreorderCreateSchema = z.object({
  firstName: customerProfileCompletionSchema.shape.firstName,
  lastName: customerProfileCompletionSchema.shape.lastName,
  email: z
    .string()
    .trim()
    .email("Adresse e-mail invalide.")
    .max(180, "L'adresse e-mail ne peut pas dépasser 180 caractères.")
    .transform((value) => value.toLowerCase()),
  phone: customerProfileCompletionSchema.shape.phone,
});
