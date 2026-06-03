import { z } from "zod";

const productReferenceSchema = z
  .object({
    productId: z.string().trim().optional(),
    slug: z.string().trim().optional(),
  })
  .refine((value) => Boolean(value.productId || value.slug), {
    message: "Référence produit requise.",
  });

export const addCartItemSchema = productReferenceSchema.extend({
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99),
});
