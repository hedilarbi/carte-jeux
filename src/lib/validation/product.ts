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

const productCreateShape = {
  title: z.string().trim().min(2).max(180),
  slug: optionalSlugSchema,
  shortDescription: optionalString(300),
  description: optionalString(4000),
  image: optionalUrlSchema,
  gallery: z.array(z.string().trim().url()).optional().default([]),
  categoryId: objectIdSchema,
  platformId: objectIdSchema,
  regionId: objectIdSchema,
  faceValue: nonNegativeNumberSchema,
  currency: currencySchema,
  price: nonNegativeNumberSchema,
  discountPercent: percentageSchema.optional().default(0),
  sku: z.string().trim().min(3).max(120),
  productType: z.enum(PRODUCT_TYPE_OPTIONS),
  deliveryMode: z.enum(DELIVERY_MODE_OPTIONS).default("manual_email"),
  isFeatured: z.boolean().optional().default(false),
  isActive: booleanDefaultTrueSchema,
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
  categoryId: objectIdSchema,
  platformId: objectIdSchema,
  regionId: objectIdSchema,
  faceValue: nonNegativeNumberSchema,
  currency: currencySchema,
  price: nonNegativeNumberSchema,
  discountPercent: percentageSchema.optional(),
  sku: z.string().trim().min(3).max(120),
  productType: z.enum(PRODUCT_TYPE_OPTIONS),
  deliveryMode: z.enum(DELIVERY_MODE_OPTIONS).optional(),
  isFeatured: z.boolean().optional(),
  isActive: booleanSchema.optional(),
  seoTitle: optionalString(160),
  seoDescription: optionalString(320),
};

export const productCreateSchema = z.object(productCreateShape);
export const productUpdateSchema = createUpdateSchema(productUpdateShape);
