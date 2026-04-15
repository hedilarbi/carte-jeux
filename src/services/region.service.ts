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
    assertObjectId(id, "Region id");

    const region = await getRegionById(id);

    if (!region) {
      throw new AppError("Region not found.", 404);
    }

    return serializeDocument<Region>(region);
  },

  async create(input: z.input<typeof regionCreateSchema>) {
    const parsed = regionCreateSchema.parse(input);

    if (await existsRegionCode(parsed.code)) {
      throw new AppError("Region code already exists.", 409);
    }

    const created = await createRegion(parsed);
    return serializeDocument<Region>(created);
  },

  async update(id: string, input: z.input<typeof regionUpdateSchema>) {
    assertObjectId(id, "Region id");

    const existing = await getRegionById(id);

    if (!existing) {
      throw new AppError("Region not found.", 404);
    }

    const parsed = regionUpdateSchema.parse(input);

    if (parsed.code && (await existsRegionCode(parsed.code, id))) {
      throw new AppError("Region code already exists.", 409);
    }

    const updated = await updateRegionById(id, parsed);

    if (!updated) {
      throw new AppError("Region not found.", 404);
    }

    return serializeDocument<Region>(updated);
  },

  async delete(id: string) {
    assertObjectId(id, "Region id");

    const linkedProducts = await countProductsByRegionId(id);

    if (linkedProducts > 0) {
      throw new AppError(
        "This region is attached to existing products and cannot be deleted.",
        409,
      );
    }

    const deleted = await deleteRegionById(id);

    if (!deleted) {
      throw new AppError("Region not found.", 404);
    }

    return {
      success: true,
    };
  },
};
