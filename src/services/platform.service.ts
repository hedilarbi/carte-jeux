import { z } from "zod";

import { AppError } from "@/lib/utils/app-error";
import { assertObjectId } from "@/lib/utils/object-id";
import {
  createPaginatedResult,
  resolvePagination,
} from "@/lib/utils/pagination";
import { serializeDocument } from "@/lib/utils/serialization";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug";
import {
  platformCreateSchema,
  platformUpdateSchema,
} from "@/lib/validation/platform";
import {
  countProductsByPlatformId,
} from "@/repositories/product.repository";
import {
  createPlatform,
  deletePlatformById,
  existsPlatformSlug,
  getPlatformById,
  listPlatforms,
  type PlatformListFilters,
  updatePlatformById,
} from "@/repositories/platform.repository";
import type { Platform } from "@/types/entities";

async function resolvePlatformSlug(source: string, excludeId?: string) {
  const candidate = generateSlug(source);

  if (!candidate) {
    throw new AppError("Unable to generate a valid platform slug.", 400);
  }

  return generateUniqueSlug(candidate, (slug) =>
    existsPlatformSlug(slug, excludeId),
  );
}

export const platformService = {
  async list(filters: PlatformListFilters = {}) {
    const result = await listPlatforms(filters);
    const pagination = resolvePagination(filters);

    return createPaginatedResult<Platform>(
      serializeDocument<Platform[]>(result.items),
      result.totalItems,
      pagination,
    );
  },

  async listActive() {
    const result = await listPlatforms({ page: 1, limit: 100, isActive: true });
    return serializeDocument<Platform[]>(result.items);
  },

  async getById(id: string) {
    assertObjectId(id, "Platform id");

    const platform = await getPlatformById(id);

    if (!platform) {
      throw new AppError("Platform not found.", 404);
    }

    return serializeDocument<Platform>(platform);
  },

  async create(input: z.input<typeof platformCreateSchema>) {
    const parsed = platformCreateSchema.parse(input);
    const slug = await resolvePlatformSlug(parsed.slug ?? parsed.name);
    const created = await createPlatform({
      ...parsed,
      slug,
    });

    return serializeDocument<Platform>(created);
  },

  async update(id: string, input: z.input<typeof platformUpdateSchema>) {
    assertObjectId(id, "Platform id");

    const existing = await getPlatformById(id);

    if (!existing) {
      throw new AppError("Platform not found.", 404);
    }

    const parsed = platformUpdateSchema.parse(input);
    const slug = parsed.slug
      ? await resolvePlatformSlug(parsed.slug, id)
      : undefined;

    const updated = await updatePlatformById(id, {
      ...parsed,
      slug,
    });

    if (!updated) {
      throw new AppError("Platform not found.", 404);
    }

    return serializeDocument<Platform>(updated);
  },

  async delete(id: string) {
    assertObjectId(id, "Platform id");

    const linkedProducts = await countProductsByPlatformId(id);

    if (linkedProducts > 0) {
      throw new AppError(
        "This platform is attached to existing products and cannot be deleted.",
        409,
      );
    }

    const deleted = await deletePlatformById(id);

    if (!deleted) {
      throw new AppError("Platform not found.", 404);
    }

    return {
      success: true,
    };
  },
};
