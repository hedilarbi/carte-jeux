import type { NextRequest } from "next/server";

import { getAdminApiSession } from "@/lib/auth/admin";
import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "@/lib/utils/api-response";
import { g2aStockSyncService } from "@/services/g2a-stock-sync.service";

export const dynamic = "force-dynamic";

function getNumberValue(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

async function isCronAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (cronSecret) {
    return request.headers.get("authorization") === `Bearer ${cronSecret}`;
  }

  if (process.env.NODE_ENV !== "production") {
    return Boolean(await getAdminApiSession(request));
  }

  return false;
}

async function handleG2AStockSync(request: NextRequest) {
  if (!(await isCronAuthorized(request))) {
    return errorResponse("Non autorisé.", 401);
  }

  try {
    const body =
      request.method === "POST" ? await request.json().catch(() => ({})) : {};
    const batchSize =
      getNumberValue(body.batchSize) ??
      getNumberValue(request.nextUrl.searchParams.get("batchSize"));
    const data = await g2aStockSyncService.runNextBatch({
      batchSize,
    });

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: NextRequest) {
  return handleG2AStockSync(request);
}

export async function POST(request: NextRequest) {
  return handleG2AStockSync(request);
}
