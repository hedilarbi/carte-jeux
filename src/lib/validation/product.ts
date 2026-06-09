import { z } from "zod";

import { DELIVERY_MODE_OPTIONS, PRODUCT_TYPE_OPTIONS } from "@/constants/admin";
import {
  booleanDefaultTrueSchema,
  booleanSchema,
  createUpdateSchema,
  currencySchema,
  nonNegativeNumberSchema,
  objectIdSchema,
  optionalSlugSchema,
  optionalString,
  optionalUrlSchema,
  percentageSchema,
} from "@/lib/validation/common";

const regionIdsSchema = z
  .array(objectIdSchema)
  .min(1, "Sélectionnez au moins une région.");

const categoryIdsSchema = z
  .array(objectIdSchema)
  .min(1, "Sélectionnez au moins une catégorie.");

const productFaqItemSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, "La question FAQ doit contenir au moins 2 caractères.")
    .max(240, "La question FAQ ne peut pas dépasser 240 caractères."),
  answer: z
    .string()
    .trim()
    .min(2, "La réponse FAQ doit contenir au moins 2 caractères.")
    .max(1200, "La réponse FAQ ne peut pas dépasser 1200 caractères."),
});

const productFaqItemsSchema = z
  .array(productFaqItemSchema)
  .max(12, "Un produit ne peut pas contenir plus de 12 questions FAQ.")
  .optional()
  .default([]);

const productCreateShape = {
  title: z.string().trim().min(2).max(180),
  slug: optionalSlugSchema,
  shortDescription: optionalString(300),
  description: optionalString(4000),
  image: optionalUrlSchema,
  gallery: z.array(z.string().trim().url()).optional().default([]),
  categoryId: objectIdSchema.optional(),
  categoryIds: categoryIdsSchema.optional(),
  platformId: objectIdSchema,
  regionIds: regionIdsSchema,
  faceValue: nonNegativeNumberSchema,
  currency: currencySchema,
  price: nonNegativeNumberSchema,
  discountPercent: percentageSchema.optional().default(0),
  sku: z.string().trim().min(3).max(120),
  productType: z.enum(PRODUCT_TYPE_OPTIONS),
  deliveryMode: z.enum(DELIVERY_MODE_OPTIONS).default("manual_email"),
  isFeatured: z.boolean().optional().default(false),
  isActive: booleanDefaultTrueSchema,
  faqItems: productFaqItemsSchema,
  seoTitle: optionalString(160),
  seoDescription: optionalString(320),
};

const productUpdateShape = {
  title: z.string().trim().min(2).max(180),
  slug: optionalSlugSchema,
  shortDescription: optionalString(300),
  description: optionalString(4000),
  image: optionalUrlSchema,
  gallery: z.array(z.string().trim().url()).optional(),
  categoryId: objectIdSchema.optional(),
  categoryIds: categoryIdsSchema,
  platformId: objectIdSchema,
  regionIds: regionIdsSchema,
  faceValue: nonNegativeNumberSchema,
  currency: currencySchema,
  price: nonNegativeNumberSchema,
  discountPercent: percentageSchema.optional(),
  sku: z.string().trim().min(3).max(120),
  productType: z.enum(PRODUCT_TYPE_OPTIONS),
  deliveryMode: z.enum(DELIVERY_MODE_OPTIONS).optional(),
  isFeatured: z.boolean().optional(),
  isActive: booleanSchema.optional(),
  faqItems: productFaqItemsSchema.optional(),
  seoTitle: optionalString(160),
  seoDescription: optionalString(320),
};

export const productCreateSchema = z.object(productCreateShape);
export const productUpdateSchema = createUpdateSchema(productUpdateShape);
