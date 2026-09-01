import type { z } from "zod";

import {
  createPaginatedResult,
  resolvePagination,
} from "@/lib/utils/pagination";
import { serializeDocument } from "@/lib/utils/serialization";
import { gtaPreorderCreateSchema } from "@/lib/validation/gta-preorder";
import {
  createGtaPreorder,
  listGtaPreorders,
  type GtaPreorderListFilters,
} from "@/repositories/gta-preorder.repository";
import type { GtaPreorder } from "@/types/entities";

export const gtaPreorderService = {
  async create(
    input: z.input<typeof gtaPreorderCreateSchema>,
    product: "fc-27" | "gta-vi" = "gta-vi",
  ) {
    const parsed = gtaPreorderCreateSchema.parse(input);

    const preorder = await createGtaPreorder({
      ...parsed,
      product,
    });

    return serializeDocument<GtaPreorder>(preorder);
  },

  async list(filters: GtaPreorderListFilters = {}) {
    const result = await listGtaPreorders(filters);
    const pagination = resolvePagination(filters);

    return createPaginatedResult<GtaPreorder>(
      serializeDocument<GtaPreorder[]>(result.items),
      result.totalItems,
      pagination,
    );
  },
};
