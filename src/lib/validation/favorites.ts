import { z } from "zod";

export const favoriteProductReferenceSchema = z
  .object({
    productId: z.string().trim().optional(),
    slug: z.string().trim().optional(),
  })
  .refine((value) => Boolean(value.productId || value.slug), {
    message: "Référence produit requise.",
  });
