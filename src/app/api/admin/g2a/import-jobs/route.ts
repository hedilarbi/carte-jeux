import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { g2aImportJobService } from "@/services/g2a-import-job.service";

function getNumberValue(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function getBooleanValue(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

export async function GET(request: NextRequest) {
  if (!(await getAdminApiSession(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const limit = getNumberValue(request.nextUrl.searchParams.get("limit"));
    const data = await g2aImportJobService.list(limit);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminApiSession(request);

  if (!session) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data = await g2aImportJobService.start({
      startPage: getNumberValue(body.startPage),
      itemsPerPage: getNumberValue(body.itemsPerPage),
      maxPages: getNumberValue(body.maxPages),
      syncTaxonomies: getBooleanValue(body.syncTaxonomies),
      delayMs: getNumberValue(body.delayMs),
      requestedByEmail: session.email,
    });

    return successResponse(data, { status: 202 });
  } catch (error) {
    return handleRouteError(error);
  }
}
