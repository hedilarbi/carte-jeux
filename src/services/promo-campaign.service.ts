import { Types } from "mongoose";
import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { assertObjectId } from "@/lib/utils/object-id";
import { serializeDocument } from "@/lib/utils/serialization";
import {
  promoCampaignCreateSchema,
  promoCampaignUpdateSchema,
} from "@/lib/validation/promo-campaign";
import {
  createPromoCampaign,
  deletePromoCampaignById,
  getPromoCampaignById,
  listPromoCampaigns,
  updatePromoCampaignById,
} from "@/repositories/promo-campaign.repository";
import type { PromoCampaign } from "@/types/entities";

function normalizeProductIds(productIds: string[]) {
  return productIds.map((productId) => new Types.ObjectId(productId));
}

export const promoCampaignService = {
  async list() {
    return serializeDocument<PromoCampaign[]>(await listPromoCampaigns());
  },

  async getById(id: string) {
    assertObjectId(id, "Promo campaign id");

    const campaign = await getPromoCampaignById(id);

    if (!campaign) {
      throw new AppError("Promo campaign not found.", 404);
    }

    return serializeDocument<PromoCampaign>(campaign);
  },

  async create(input: z.input<typeof promoCampaignCreateSchema>) {
    const parsed = promoCampaignCreateSchema.parse(input);
    const created = await createPromoCampaign({
      ...parsed,
      productIds: normalizeProductIds(parsed.productIds),
    });

    return serializeDocument<PromoCampaign>(created);
  },

  async update(id: string, input: z.input<typeof promoCampaignUpdateSchema>) {
    assertObjectId(id, "Promo campaign id");

    const parsed = promoCampaignUpdateSchema.parse(input);
    const updated = await updatePromoCampaignById(id, {
      ...parsed,
      ...(parsed.productIds
        ? { productIds: normalizeProductIds(parsed.productIds) }
        : {}),
    });

    if (!updated) {
      throw new AppError("Promo campaign not found.", 404);
    }

    return serializeDocument<PromoCampaign>(updated);
  },

  async delete(id: string) {
    assertObjectId(id, "Promo campaign id");

    const deleted = await deletePromoCampaignById(id);

    if (!deleted) {
      throw new AppError("Promo campaign not found.", 404);
    }

    return {
      success: true,
    };
  },
};
