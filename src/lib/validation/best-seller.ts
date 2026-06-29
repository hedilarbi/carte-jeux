import { z } from "zod";

import { objectIdSchema } from "@/lib/validation/common";

export const bestSellerUpdateSchema = z
  .object({
    productIds: z.array(objectIdSchema),
  })
  .refine(
    (value) => new Set(value.productIds).size === value.productIds.length,
    "Chaque produit ne peut apparaître qu'une seule fois.",
  );
