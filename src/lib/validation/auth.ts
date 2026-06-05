import { z } from "zod";

export const customerProfileCompletionSchema = z.object({
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
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s().-]{6,24}$/,
      "Le numéro de téléphone est invalide.",
    )
    .transform((value) => value.replace(/\s+/g, " ")),
});

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
    firstName: customerProfileCompletionSchema.shape.firstName,
    lastName: customerProfileCompletionSchema.shape.lastName,
    phone: customerProfileCompletionSchema.shape.phone,
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

export const customerRegistrationOtpVerifySchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Le code OTP doit contenir 6 chiffres."),
});

export const customerRegistrationOtpResendSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
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
