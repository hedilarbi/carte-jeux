import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const customerLoginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const customerRegisterSchema = z
  .object({
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    passwordConfirmation: z.string().min(1, "La confirmation est requise."),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["passwordConfirmation"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(20, "Le lien de réinitialisation est invalide."),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    passwordConfirmation: z.string().min(1, "La confirmation est requise."),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["passwordConfirmation"],
  });
