import type { NextRequest } from "next/server";

import { handleRouteError, successResponse } from "@/lib/utils/api-response";
import { catalogService } from "@/services/catalog.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await catalogService.getProductsPageContent({
      limit: searchParams.get("limit") ?? undefined,
      max: searchParams.get("max") ?? undefined,
      min: searchParams.get("min") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      platform: searchParams.getAll("platform"),
      q: searchParams.get("q") ?? undefined,
      region: searchParams.getAll("region"),
      search: searchParams.get("search") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      type: searchParams.getAll("type"),
    });

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
