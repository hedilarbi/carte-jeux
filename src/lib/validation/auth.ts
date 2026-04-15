import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Le mot de passe est requis."),
});
