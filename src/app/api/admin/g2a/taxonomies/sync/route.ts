import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { g2aTaxonomyService } from "@/services/g2a-taxonomy.service";

function getNumberValue(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

export async function POST(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data = await g2aTaxonomyService.syncFromProductPage({
      page: getNumberValue(body.page),
      itemsPerPage: getNumberValue(body.itemsPerPage),
    });

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
