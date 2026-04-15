import { z } from "zod";

import { PROMO_CAMPAIGN_TYPE_OPTIONS } from "@/constants/admin";
import {
  booleanDefaultTrueSchema,
  booleanSchema,
  createUpdateSchema,
  objectIdSchema,
} from "@/lib/validation/common";

const promoCampaignCreateShape = {
  name: z.string().trim().min(2).max(160),
  type: z.enum(PROMO_CAMPAIGN_TYPE_OPTIONS),
  value: z.number().min(0).max(100),
  productIds: z.array(objectIdSchema).default([]),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  isActive: booleanDefaultTrueSchema,
};

const promoCampaignUpdateShape = {
  name: z.string().trim().min(2).max(160),
  type: z.enum(PROMO_CAMPAIGN_TYPE_OPTIONS),
  value: z.number().min(0).max(100),
  productIds: z.array(objectIdSchema).optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  isActive: booleanSchema.optional(),
};

export const promoCampaignCreateSchema = z.object(promoCampaignCreateShape);
export const promoCampaignUpdateSchema = createUpdateSchema(
  promoCampaignUpdateShape,
);
