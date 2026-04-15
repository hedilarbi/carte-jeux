import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { assertObjectId } from "@/lib/utils/object-id";
import {
  createPaginatedResult,
  resolvePagination,
} from "@/lib/utils/pagination";
import { serializeDocument } from "@/lib/utils/serialization";
import {
  regionCreateSchema,
  regionUpdateSchema,
} from "@/lib/validation/region";
import {
  countProductsByRegionId,
} from "@/repositories/product.repository";
import {
  createRegion,
  deleteRegionById,
  existsRegionCode,
  getRegionById,
  listAllRegions,
  listRegions,
  type RegionListFilters,
  updateRegionById,
} from "@/repositories/region.repository";
import type { Region } from "@/types/entities";

export const regionService = {
  async list(filters: RegionListFilters = {}) {
    const result = await listRegions(filters);
    const pagination = resolvePagination(filters);

    return createPaginatedResult<Region>(
      serializeDocument<Region[]>(result.items),
      result.totalItems,
      pagination,
    );
  },

  async listActive() {
    return serializeDocument<Region[]>(await listAllRegions());
  },

  async getById(id: string) {
    assertObjectId(id, "Identifiant de région");

    const region = await getRegionById(id);

    if (!region) {
      throw new AppError("Région introuvable.", 404);
    }

    return serializeDocument<Region>(region);
  },

  async create(input: z.input<typeof regionCreateSchema>) {
    const parsed = regionCreateSchema.parse(input);

    if (await existsRegionCode(parsed.code)) {
      throw new AppError("Le code région existe déjà.", 409);
    }

    const created = await createRegion(parsed);
    return serializeDocument<Region>(created);
  },

  async update(id: string, input: z.input<typeof regionUpdateSchema>) {
    assertObjectId(id, "Identifiant de région");

    const existing = await getRegionById(id);

    if (!existing) {
      throw new AppError("Région introuvable.", 404);
    }

    const parsed = regionUpdateSchema.parse(input);

    if (parsed.code && (await existsRegionCode(parsed.code, id))) {
      throw new AppError("Le code région existe déjà.", 409);
    }

    const updated = await updateRegionById(id, parsed);

    if (!updated) {
      throw new AppError("Région introuvable.", 404);
    }

    return serializeDocument<Region>(updated);
  },

  async delete(id: string) {
    assertObjectId(id, "Identifiant de région");

    const linkedProducts = await countProductsByRegionId(id);

    if (linkedProducts > 0) {
      throw new AppError(
        "Cette région est liée à des produits existants et ne peut pas être supprimée.",
        409,
      );
    }

    const deleted = await deleteRegionById(id);

    if (!deleted) {
      throw new AppError("Région introuvable.", 404);
    }

    return {
      success: true,
    };
  },
};
